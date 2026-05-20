import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { generateRunId, runWorkflow, type StepRunners } from "../runner";
import { getById, getLatest } from "../results";
import { DASHBOARD_SLUGS } from "../views/dashboard";
import {
  DEFAULT_TTL_MS,
  generateShareToken,
  verifyShareToken,
} from "../share-token";
import { loadWorkflow } from "../spec";
import { ExecutiveDashboardPage } from "../views/dashboard";
import { ErrorPage } from "../views/error";
import { WorkflowListPage } from "../views/index";
import { WorkflowRunPage } from "../views/run";
import { ShareDisabledPage, ShareResultPage } from "../views/share";
import { listWorkflows, type WorkflowEntry } from "../workflows-dir";

export type WorkflowRoutesDeps = {
  workflowsDir: string;
  runsDir: string;
  runners: StepRunners;
  // Sales-facing contact for the "Pilot 미팅 신청" CTA. Plain email — the
  // server builds the mailto URL with a fixed Korean subject. Override via
  // FLOWAGENT_PILOT_CONTACT_EMAIL only if you fork for your own sales channel;
  // the default below is the FlowAgent official channel.
  pilotContactEmail?: string;
  /**
   * HMAC signing secret for `/share/*` URLs (spec § 5 옵션 2 — 사장이 폰으로
   * 결과 보기). When undefined, the share routes show a "공유 기능 비활성화"
   * page instead of a token. Set via FLOWAGENT_SHARE_SECRET — must be at
   * least 32 characters (`openssl rand -base64 32`).
   */
  shareSecret?: string;
  /**
   * Optional public origin (e.g. `https://flowagent.example.com`) used when
   * building share URLs. When unset, x-forwarded-proto/x-forwarded-host
   * headers are honored if present, falling back to the request URL itself.
   * Useful behind a reverse proxy (nginx, Cloudflare) where the Node server
   * sees `localhost` but the user-facing URL is the public domain.
   */
  publicOrigin?: string;
};

// Official FlowAgent sales channel (사업자등록번호 607-20-94796). General users
// who download the zip and run `pnpm dev` get a working mailto link without
// any .env edit — the Pilot CTA banner just works out of the box.
const DEFAULT_PILOT_CONTACT_EMAIL = "wndnjs3865@naver.com";
const PILOT_MAIL_SUBJECT = "FlowAgent Pilot 미팅 신청";

function buildPilotMailto(email: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(PILOT_MAIL_SUBJECT)}`;
}

export function createWorkflowRoutes(deps: WorkflowRoutesDeps): Hono {
  const app = new Hono();
  const pilotContactEmail =
    deps.pilotContactEmail ?? DEFAULT_PILOT_CONTACT_EMAIL;
  const pilotContactUrl = buildPilotMailto(pilotContactEmail);

  app.get("/", (c) => {
    const list = listWorkflows(deps.workflowsDir);
    return c.html(WorkflowListPage({ items: list, pilotContactUrl }));
  });

  // Executive dashboard — mobile-friendly single-page summary of the 4
  // workflows a D-persona CEO checks daily. Reads the latest run per workflow
  // from `runsDir` and renders a preview card per slot. Empty state shows
  // a "지금 실행 →" link to the workflow detail page.
  app.get("/executive", (c) => {
    const runsBySlug: Record<string, ReturnType<typeof getLatest>> = {};
    for (const slug of DASHBOARD_SLUGS) {
      runsBySlug[slug] = getLatest(deps.runsDir, slug);
    }
    return c.html(
      ExecutiveDashboardPage({
        runsBySlug,
        shareEnabled: Boolean(deps.shareSecret),
      }),
    );
  });

  // Create a share URL for the latest run of a workflow. Hits the same code
  // path as the dashboard's "📱 공유" link — server-side flow only, no JS in
  // the browser, no clipboard API. Redirects to /share/<token> on success.
  app.get("/share/new", (c) => {
    if (!deps.shareSecret) {
      return c.html(ShareDisabledPage(), 503);
    }
    const workflow = c.req.query("workflow");
    if (!workflow) {
      return c.html(
        ErrorPage({
          status: 400,
          title: "공유 URL 요청에 workflow 누락",
          detail: "/share/new?workflow=<slug> 형식으로 호출하세요.",
        }),
        400,
      );
    }
    const latest = getLatest(deps.runsDir, workflow);
    if (!latest) {
      return c.html(
        ErrorPage({
          status: 404,
          title: "공유할 실행 결과 없음",
          detail: `워크플로 "${workflow}"의 최근 실행 결과가 없습니다. 본사 노트북에서 한 번 실행한 뒤 다시 시도하세요.`,
        }),
        404,
      );
    }
    const expiresAt = Date.now() + DEFAULT_TTL_MS;
    const token = generateShareToken(
      { workflow, runId: latest.runId, expiresAt },
      deps.shareSecret,
    );
    return c.redirect(`/share/${token}`, 302);
  });

  // Verify a share token and render the single-card result page. Invalid,
  // tampered, or expired tokens all show a generic 404 (don't leak which one
  // failed — the casual user just sees "링크가 만료됐거나 잘못됐어요").
  app.get("/share/:token", (c) => {
    if (!deps.shareSecret) {
      return c.html(ShareDisabledPage(), 503);
    }
    const token = c.req.param("token");
    const payload = verifyShareToken(token, deps.shareSecret);
    if (!payload) {
      return c.html(
        ErrorPage({
          status: 404,
          title: "공유 링크가 만료됐거나 잘못됐어요",
          detail: "본사 노트북에서 새 공유 링크를 만들어 받아주세요.",
        }),
        404,
      );
    }
    const run = getById(deps.runsDir, payload.runId);
    if (!run || run.workflowName !== payload.workflow) {
      return c.html(
        ErrorPage({
          status: 404,
          title: "공유 링크의 실행 결과를 찾을 수 없어요",
          detail: "실행 기록이 정리됐을 수 있습니다. 새 링크를 받아주세요.",
        }),
        404,
      );
    }
    const origin = resolvePublicOrigin(c, deps.publicOrigin);
    const shareUrl = `${origin}/share/${token}`;
    return c.html(
      ShareResultPage({
        run,
        expiresAt: payload.expiresAt,
        shareUrl,
      }),
    );
  });

  app.get("/workflows/:name", (c) => {
    const name = c.req.param("name");
    const entry = findEntry(deps.workflowsDir, name);
    if (!entry) {
      return c.html(
        ErrorPage({
          status: 404,
          title: "Workflow not found",
          detail: `No workflow named "${name}" in ${deps.workflowsDir}/.`,
        }),
        404,
      );
    }
    try {
      const wf = loadWorkflow(entry.path);
      return c.html(
        WorkflowRunPage({
          slug: name,
          displayName: wf.name,
          description: wf.description,
          stepCount: wf.steps.length,
        }),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return c.html(
        ErrorPage({
          status: 500,
          title: "Workflow load error",
          detail: msg,
        }),
        500,
      );
    }
  });

  app.post("/workflows/:name/run", async (c) => {
    const name = c.req.param("name");
    const entry = findEntry(deps.workflowsDir, name);
    if (!entry) return c.notFound();
    const wf = loadWorkflow(entry.path);
    const runId = generateRunId();
    // Lazy-create runsDir so the user does not have to mkdir up front.
    await mkdir(deps.runsDir, { recursive: true });
    const logPath = join(deps.runsDir, `${runId}.jsonl`);

    return streamSSE(c, async (stream) => {
      await runWorkflow(
        wf,
        async (event) => {
          // Disk first, then SSE — keeps the audit log lossless even if the
          // client disconnects mid-stream.
          try {
            await appendFile(logPath, JSON.stringify(event) + "\n");
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[flowagent] run log append failed (${logPath}): ${msg}`);
          }
          await stream.writeSSE({
            data: JSON.stringify(event),
            event: event.kind,
          });
        },
        deps.runners,
        { runId },
      );
    });
  });

  return app;
}

function findEntry(dir: string, name: string): WorkflowEntry | undefined {
  return listWorkflows(dir).find((w) => w.name === name);
}

/**
 * Resolve the user-facing origin for share URLs. Priority:
 *   1. Explicit `publicOrigin` dep (FLOWAGENT_PUBLIC_ORIGIN env var)
 *   2. `x-forwarded-proto` + `x-forwarded-host` headers (reverse proxy)
 *   3. The request's own URL (single-server case, also Node listening on
 *      0.0.0.0 with a public hostname)
 *
 * The proxy-header path is conservative: it requires BOTH headers to be
 * present, since trusting only one can cause scheme/host mismatch.
 */
type RequestLike = {
  req: { url: string; header: (name: string) => string | undefined };
};

function resolvePublicOrigin(c: RequestLike, override?: string): string {
  if (override && override.length > 0) {
    return override.replace(/\/$/, "");
  }
  const fwdProto = c.req.header("x-forwarded-proto");
  const fwdHost = c.req.header("x-forwarded-host");
  if (fwdProto && fwdHost) {
    return `${fwdProto}://${fwdHost}`;
  }
  return new URL(c.req.url).origin;
}
