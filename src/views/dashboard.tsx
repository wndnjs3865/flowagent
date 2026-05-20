import type { Result } from "../results";
import { Layout } from "./layout";

// Curated dashboard cards — only the 4 workflows a Korean SMB CEO would
// realistically want as a single-screen daily summary. B-persona workflows
// (quote-email, sales-followup, sns-replies) are NOT on this dashboard —
// they target solo freelancers, not D persona.
type DashboardSlot = {
  slug: string;
  icon: string;
  label: string;
  context: string;
};

const DASHBOARD_SLOTS: DashboardSlot[] = [
  {
    slug: "sales-summary",
    icon: "📊",
    label: "매출",
    context: "월간 매출 → 임원 3-문장 요약",
  },
  {
    slug: "approval-triage",
    icon: "✅",
    label: "결재",
    context: "결재함 → 오늘 처리할 brief",
  },
  {
    slug: "inquiry-triage",
    icon: "💬",
    label: "문의",
    context: "오늘 접수 → 분류 + 답변 초안",
  },
  {
    slug: "weekly-report",
    icon: "📝",
    label: "주간 보고",
    context: "한 주 진행 → Slack 공유 메시지",
  },
];

/** Slugs the executive dashboard cares about. Exported so the route can
 * resolve a `Result | null` per slot via `getLatest(dir, slug)`. */
export const DASHBOARD_SLUGS = DASHBOARD_SLOTS.map((s) => s.slug);

// Trim a long LLM output to a single-screen preview, capped at ~280 Korean
// chars (≈ a tweet's length). Uses `Array.from` to slice by Unicode code
// points instead of UTF-16 code units, so multi-unit characters like emoji
// (🇰🇷, 👨‍👩‍👧) or supplementary-plane CJK (𠮷) don't get cut between
// surrogate halves, which would render as ��. Not strict grapheme clusters
// (that would require Intl.Segmenter and is overkill for a preview), but
// covers the cases LLM output actually emits.
const PREVIEW_LIMIT = 280;

function previewOutput(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) return "";
  const codePoints = Array.from(trimmed);
  if (codePoints.length <= PREVIEW_LIMIT) return trimmed;
  return codePoints.slice(0, PREVIEW_LIMIT).join("") + "…";
}

// Format ISO timestamp as a friendly Korean relative-time label.
// "방금 전" (< 1m), "N분 전" (< 1h), "N시간 전" (< 24h), "N일 전" (< 7d),
// otherwise ISO date.
//
// NOTE: Computed server-side at render time. For the default Pilot setup
// (server and viewer on the same laptop) this is fine. For Cloud deployments
// or if /executive ever gets cached at a proxy, the label can freeze at
// cache time. The label is wrapped in a `<time datetime="...">` element
// in the rendered JSX so browsers can show the underlying UTC timestamp as
// a native tooltip even when the relative label is stale.
function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return iso;
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  return iso.slice(0, 10);
}

export function ExecutiveDashboardPage(props: {
  /** Resolved `Result | null` keyed by workflow slug. Route builds this
   * via `getLatest(runsDir, slug)` for each DASHBOARD_SLUGS entry. */
  runsBySlug: Record<string, Result | null>;
  shareEnabled?: boolean;
  generatedAt?: Date;
}) {
  const now = props.generatedAt ?? new Date();

  return (
    <Layout title="사장 대시보드">
      <header class="mb-6">
        <div class="flex items-baseline justify-between">
          <h1 class="text-3xl font-bold tracking-tight">사장 대시보드</h1>
          <a
            href="/"
            class="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            ← 워크플로 목록
          </a>
        </div>
        <p class="mt-2 text-lg font-medium text-gray-800">
          오늘의 매출 · 결재 잔량 · 문의 큐 · 주간 진행 한 페이지.
        </p>
        <p class="mt-1 text-sm text-gray-600">
          각 카드는 해당 워크플로의 가장 최근 실행 결과 미리보기입니다. 전체 결과는 카드 클릭.
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-2">
        {DASHBOARD_SLOTS.map((slot) => {
          const run = props.runsBySlug[slot.slug] ?? null;
          if (!run) {
            return (
              <div class="rounded-xl border border-dashed border-gray-300 bg-white p-5">
                <div class="flex items-center gap-2">
                  <span aria-hidden="true" class="text-xl leading-none">
                    {slot.icon}
                  </span>
                  <h2 class="text-base font-semibold text-gray-700">
                    {slot.label}
                  </h2>
                  <span class="ml-auto text-xs text-gray-400 font-mono">
                    {slot.slug}
                  </span>
                </div>
                <p class="mt-3 text-sm text-gray-500 italic">
                  최근 실행 없음 — {slot.context}
                </p>
                <div class="mt-4 pt-3 border-t border-gray-100">
                  <a
                    href={`/workflows/${slot.slug}`}
                    class="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    지금 실행 →
                  </a>
                </div>
              </div>
            );
          }

          return (
            <div class="rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-400 hover:shadow-md transition">
              <a href={`/workflows/${slot.slug}`} class="block group">
                <div class="flex items-center gap-2">
                  <span aria-hidden="true" class="text-xl leading-none">
                    {slot.icon}
                  </span>
                  <h2 class="text-base font-semibold text-gray-900 group-hover:text-blue-700">
                    {slot.label}
                  </h2>
                  <span class="ml-auto text-xs text-gray-400 font-mono">
                    {slot.slug}
                  </span>
                </div>
                <p class="mt-1 text-xs text-gray-500">{slot.context}</p>
                <pre class="mt-3 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {previewOutput(run.lastOutput) || "(빈 결과)"}
                </pre>
              </a>
              <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                <time
                  datetime={run.startedAt}
                  class="text-xs text-gray-500"
                  title={run.startedAt}
                >
                  {relativeTime(run.startedAt, now)}
                </time>
                <div class="flex items-center gap-3 text-xs">
                  {props.shareEnabled ? (
                    <a
                      href={`/share/new?workflow=${encodeURIComponent(slot.slug)}`}
                      class="inline-flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900"
                      title="1시간 만료 공유 링크 만들기"
                    >
                      📱 공유
                    </a>
                  ) : null}
                  <a
                    href={`/workflows/${slot.slug}`}
                    class="font-medium text-blue-600 hover:text-blue-700"
                  >
                    전체 보기 →
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer class="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-500">
        <p>
          이 페이지는 <code class="bg-gray-100 px-1.5 py-0.5 rounded font-mono">runs/</code>
          {" "}안의 가장 최근 실행 결과를 워크플로별로 모아 보여줍니다.
          모바일에서도 같은 데이터로 자동 1단 레이아웃.
        </p>
        <p class="mt-2">
          새 실행 결과를 보고 싶으면 카드를 누르거나{" "}
          <a
            href="/"
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            워크플로 목록
          </a>
          에서 다시 실행하세요.
        </p>
      </footer>
    </Layout>
  );
}
