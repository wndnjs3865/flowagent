import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { generateRunId, runWorkflow, type StepRunners } from "../runner";
import { loadWorkflow } from "../spec";
import { ErrorPage } from "../views/error";
import { WorkflowListPage } from "../views/index";
import { WorkflowRunPage } from "../views/run";
import { listWorkflows, type WorkflowEntry } from "../workflows-dir";

export type WorkflowRoutesDeps = {
  workflowsDir: string;
  runsDir: string;
  runners: StepRunners;
  // Sales-facing contact for the "Pilot 미팅 신청" CTA. Plain email — the
  // server builds the mailto URL with a fixed Korean subject. Lives in env
  // so the business address does not bake into source.
  pilotContactEmail?: string;
};

const DEFAULT_PILOT_CONTACT_EMAIL = "hello@flowagent.ai";
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
