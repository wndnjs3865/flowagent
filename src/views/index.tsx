import type { WorkflowEntry } from "../workflows-dir";
import { Layout } from "./layout";

type PersonaCategory = "cs" | "sales" | "admin" | "manager" | "other";

// Map a free-form persona string (e.g. "CS팀 / 운영") to a canonical filter
// category. Order matters — more specific keywords win first.
function personaCategory(persona: string | undefined): PersonaCategory {
  if (!persona) return "other";
  // "CS·운영" filter chip: CS team + operations both belong here.
  if (
    persona.includes("CS") ||
    persona.includes("고객") ||
    persona.includes("운영")
  ) {
    return "cs";
  }
  if (
    persona.includes("영업") ||
    persona.includes("매출") ||
    persona.includes("대표")
  ) {
    return "sales";
  }
  if (
    persona.includes("총무") ||
    persona.includes("사무") ||
    persona.includes("결재")
  ) {
    return "admin";
  }
  if (
    persona.includes("리드") ||
    persona.includes("매니저") ||
    persona.includes("팀장") ||
    persona.includes("PM")
  ) {
    return "manager";
  }
  return "other";
}

// Color-code the persona pill by category. Pure derivation from category.
function personaTone(cat: PersonaCategory): string {
  switch (cat) {
    case "cs":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "sales":
      return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
    case "admin":
      return "bg-violet-50 text-violet-700 ring-1 ring-violet-200";
    case "manager":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    default:
      return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  }
}

const FILTER_CHIPS: { key: PersonaCategory | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "cs", label: "CS·운영" },
  { key: "sales", label: "영업·대표보고" },
  { key: "admin", label: "총무·결재" },
  { key: "manager", label: "매니저·리드" },
];

// Tiny inline filter — toggles the `hidden` class on each card based on the
// selected chip. Plain DOM API, no framework, no build. Degrades to "all
// visible" if JS is off.
const FILTER_SCRIPT = `
(() => {
  const chips = document.querySelectorAll('[data-filter-chip]');
  const cards = document.querySelectorAll('[data-persona-category]');
  function apply(key) {
    chips.forEach((c) => {
      const active = c.getAttribute('data-filter-chip') === key;
      c.setAttribute('aria-pressed', active ? 'true' : 'false');
      c.classList.toggle('bg-gray-900', active);
      c.classList.toggle('text-white', active);
      c.classList.toggle('bg-white', !active);
      c.classList.toggle('text-gray-700', !active);
    });
    cards.forEach((card) => {
      const cat = card.getAttribute('data-persona-category');
      card.classList.toggle('hidden', key !== 'all' && cat !== key);
    });
  }
  chips.forEach((c) => {
    c.addEventListener('click', (e) => {
      e.preventDefault();
      apply(c.getAttribute('data-filter-chip'));
    });
  });
  apply('all');
})();
`;

export function WorkflowListPage(props: {
  items: WorkflowEntry[];
  pilotContactUrl: string;
}) {
  return (
    <Layout title="Workflows">
      <header class="mb-6">
        <div class="flex items-baseline justify-between">
          <h1 class="text-3xl font-bold tracking-tight">FlowAgent</h1>
          <span class="text-xs text-gray-500 font-mono">local · YAML · SSE</span>
        </div>
        <p class="mt-2 text-lg font-medium text-gray-800">
          지루한 반복 업무를 하나씩 없애드립니다.
        </p>
        <p class="mt-1 text-sm text-gray-600">
          YAML 한 파일로 정의한 로컬 워크플로우. 카드를 눌러 실행하세요.
        </p>
      </header>

      {/* Executive dashboard quick access — D persona daily landing.
          Placed above the Pilot CTA so a returning CEO doesn't have to scroll
          past the workflow list to find their daily summary. */}
      <section class="mb-4">
        <a
          href="/executive"
          class="block rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 hover:border-emerald-300 hover:bg-emerald-100 transition"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0">
              <p class="font-semibold text-emerald-900">
                📊 사장 대시보드
              </p>
              <p class="mt-0.5 text-sm text-emerald-800">
                매출 · 결재 · 문의 · 주간 진행 4 워크플로 최근 결과를 한 페이지에서 (모바일 반응형).
              </p>
            </div>
            <span class="shrink-0 text-sm font-medium text-emerald-700">
              열기 →
            </span>
          </div>
        </a>
      </section>

      {/* Pilot CTA banner */}
      <section class="mb-6 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 flex items-start gap-4">
        <span aria-hidden="true" class="text-2xl leading-none">🤝</span>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-900">
            Pilot 3사 모집 중 — 4주 같이 운영, 라이센스 0원
          </p>
          <p class="text-sm text-gray-700 mt-1">
            귀사 데이터 1건만 가져오시면 30분 미팅 자리에서 워크플로우를 함께
            만들어 드립니다.
          </p>
        </div>
        <a
          href={props.pilotContactUrl}
          class="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition"
        >
          Pilot 미팅 신청 →
        </a>
      </section>

      {/* Persona filter chips */}
      {props.items.length > 0 ? (
        <nav
          aria-label="페르소나 필터"
          class="mb-4 flex flex-wrap gap-2 items-center"
        >
          <span class="text-xs font-medium text-gray-500 mr-1">
            페르소나로 보기
          </span>
          {FILTER_CHIPS.map((chip) => (
            <button
              type="button"
              data-filter-chip={chip.key}
              aria-pressed="false"
              class="text-xs font-medium px-3 py-1.5 rounded-full ring-1 ring-gray-200 bg-white text-gray-700 hover:ring-gray-400 transition"
            >
              {chip.label}
            </button>
          ))}
        </nav>
      ) : null}

      {props.items.length === 0 ? (
        <div class="border border-dashed border-gray-300 rounded-lg p-8 text-center bg-white">
          <p class="text-gray-700 font-medium">아직 워크플로우가 없습니다.</p>
          <p class="text-sm text-gray-500 mt-2">
            <code class="bg-gray-100 px-1.5 py-0.5 rounded">workflows/</code>{" "}
            폴더에 YAML 파일을 추가하면 여기에 자동으로 표시됩니다.
          </p>
        </div>
      ) : (
        <ul class="space-y-4">
          {props.items.map((w) => {
            const cat = personaCategory(w.persona);
            return (
              <li data-persona-category={cat}>
                <a
                  href={`/workflows/${w.name}`}
                  class="block border border-gray-200 rounded-xl p-5 bg-white hover:border-blue-400 hover:shadow-md transition group"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <h2 class="text-base font-semibold text-gray-900 group-hover:text-blue-700">
                          {w.name}
                        </h2>
                        {typeof w.stepCount === "number" ? (
                          <span class="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                            {w.stepCount}단계
                          </span>
                        ) : null}
                      </div>
                      {w.description ? (
                        <p class="text-sm text-gray-700 mt-1.5 leading-relaxed">
                          {w.description}
                        </p>
                      ) : null}
                    </div>
                    {w.persona ? (
                      <span
                        class={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${personaTone(cat)}`}
                      >
                        {w.persona}
                      </span>
                    ) : null}
                  </div>
                  {w.stressRelieved ? (
                    <div class="mt-4 pt-3 border-t border-gray-100 flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        class="text-base leading-none mt-0.5"
                      >
                        💆
                      </span>
                      <p class="text-sm text-gray-600 leading-relaxed">
                        <span class="font-medium text-gray-700">
                          덜어주는 부담:
                        </span>{" "}
                        <span class="italic">{w.stressRelieved}</span>
                      </p>
                    </div>
                  ) : null}
                  <div class="mt-3 flex items-center justify-end">
                    <span class="text-xs font-medium text-blue-600 group-hover:text-blue-700">
                      실행하기 →
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      <footer class="mt-10 pt-6 border-t border-gray-200 text-xs text-gray-500">
        <p>
          새 워크플로우를 추가하려면{" "}
          <code class="bg-gray-100 px-1.5 py-0.5 rounded font-mono">
            workflows/&lt;slug&gt;.yaml
          </code>{" "}
          파일을 만든 뒤 서버를 새로고침하세요.
        </p>
      </footer>

      <script dangerouslySetInnerHTML={{ __html: FILTER_SCRIPT }} />
    </Layout>
  );
}
