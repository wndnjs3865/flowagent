import { Layout } from "./layout";

export type ShareRun = {
  workflowName: string;
  runId: string;
  startedAt: string;
  lastOutput: string;
  /** Epoch ms — UI shows "X분 후 만료" relative to current time. */
  expiresAt: number;
};

const SLOT_META: Record<string, { icon: string; label: string }> = {
  "sales-summary": { icon: "📊", label: "매출 요약" },
  "approval-triage": { icon: "✅", label: "결재 분류" },
  "inquiry-triage": { icon: "💬", label: "문의 분류" },
  "weekly-report": { icon: "📝", label: "주간 보고" },
  "meeting-actions": { icon: "📋", label: "회의 액션" },
  "quote-email": { icon: "📨", label: "견적 메일" },
  "sales-followup": { icon: "🤝", label: "영업 후처리" },
  "sns-replies": { icon: "📱", label: "SNS 답글" },
};

function expiryLabel(expiresAt: number, now: number): string {
  const diffMs = expiresAt - now;
  if (diffMs <= 0) return "만료됨";
  const min = Math.ceil(diffMs / 60_000);
  if (min < 60) return `${min}분 후 만료`;
  const hr = Math.floor(min / 60);
  const remMin = min % 60;
  return remMin === 0 ? `${hr}시간 후 만료` : `${hr}시간 ${remMin}분 후 만료`;
}

export function ShareResultPage(props: {
  run: ShareRun;
  /** Full token URL — shown in a copy box at the bottom so the recipient can re-share. */
  shareUrl: string;
  generatedAt?: Date;
}) {
  const now = (props.generatedAt ?? new Date()).getTime();
  const meta = SLOT_META[props.run.workflowName] ?? {
    icon: "📄",
    label: props.run.workflowName,
  };

  return (
    <Layout title={`${meta.label} — 공유`}>
      <header class="mb-6">
        <div class="flex items-center gap-2">
          <span aria-hidden="true" class="text-2xl leading-none">
            {meta.icon}
          </span>
          <h1 class="text-2xl font-bold tracking-tight text-gray-900">
            {meta.label}
          </h1>
        </div>
        <p class="mt-2 text-sm text-gray-600">
          FlowAgent에서 만든 결과를 공유 링크로 보고 계세요. 실행은 본사
          노트북에서, 데이터는 노트북 밖으로 나가지 않습니다 — 이 페이지의
          요약만 서명된 URL로 전달됩니다.
        </p>
      </header>

      <article class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <pre class="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap font-sans">
          {props.run.lastOutput || "(빈 결과)"}
        </pre>
      </article>

      <dl class="mt-5 grid grid-cols-2 gap-3 text-xs">
        <div class="rounded-lg bg-gray-50 px-3 py-2">
          <dt class="text-gray-500">실행 시각</dt>
          <dd class="mt-0.5 font-mono text-gray-800">
            {props.run.startedAt}
          </dd>
        </div>
        <div class="rounded-lg bg-gray-50 px-3 py-2">
          <dt class="text-gray-500">만료</dt>
          <dd class="mt-0.5 font-semibold text-gray-800">
            {expiryLabel(props.run.expiresAt, now)}
          </dd>
        </div>
      </dl>

      <section class="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p class="text-xs font-semibold text-blue-900">공유 URL</p>
        <p class="mt-1 break-all font-mono text-xs text-blue-800">
          {props.shareUrl}
        </p>
        <p class="mt-2 text-xs text-blue-700">
          이 URL은 위 만료 시각이 지나면 자동으로 작동하지 않습니다. 새 링크가
          필요하면 본사 노트북에서 다시 만들어 보내주세요.
        </p>
      </section>

      <footer class="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-500">
        <p>
          이 페이지는 본사 노트북에서 발급한 1회용 공유 링크입니다. FlowAgent는
          회사 데이터를 외부로 보내지 않으며, 이 페이지의 요약 텍스트만 서명된
          토큰에 담겨 전달됩니다.
        </p>
        <p class="mt-2">
          <a
            href="https://taskflow.kr"
            rel="noopener"
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            FlowAgent.kr →
          </a>
        </p>
      </footer>
    </Layout>
  );
}

export function ShareDisabledPage() {
  return (
    <Layout title="공유 기능 비활성화">
      <div class="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
        <h1 class="text-lg font-semibold text-yellow-900">
          공유 기능이 활성화되지 않았습니다
        </h1>
        <p class="mt-2 text-sm text-yellow-800">
          서명 토큰을 만들려면 서버에서{" "}
          <code class="bg-yellow-100 px-1.5 py-0.5 rounded font-mono">
            FLOWAGENT_SHARE_SECRET
          </code>{" "}
          환경 변수를 임의의 긴 문자열로 설정해야 합니다 (예:{" "}
          <code class="bg-yellow-100 px-1.5 py-0.5 rounded font-mono">
            openssl rand -base64 32
          </code>
          ). 그 후 서버를 다시 시작하세요.
        </p>
        <p class="mt-3 text-sm text-yellow-800">
          이 비밀 키가 노출되면 임의 사용자가 share URL을 만들 수 있으므로,
          별도 보관소(.env 파일·secrets manager)에 안전하게 저장하세요.
        </p>
        <p class="mt-4 text-xs text-yellow-700">
          <a
            href="/"
            class="font-medium underline-offset-4 hover:underline"
          >
            ← 워크플로 목록으로
          </a>
        </p>
      </div>
    </Layout>
  );
}
