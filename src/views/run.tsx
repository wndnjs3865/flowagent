import { raw } from "hono/html";
import { Layout } from "./layout";

export function WorkflowRunPage(props: {
  slug: string;
  displayName: string;
  description?: string;
  stepCount: number;
}) {
  const clientScript = buildClientScript(props.slug);
  return (
    <Layout title={props.displayName}>
      <p class="mb-4">
        <a class="text-blue-600 hover:underline" href="/">
          &larr; back
        </a>
      </p>
      <header class="mb-4">
        <h1 class="text-2xl font-bold">{props.displayName}</h1>
        {props.description ? (
          <p class="text-gray-700 mt-1">{props.description}</p>
        ) : null}
        <p class="text-sm text-gray-500 mt-1">{props.stepCount} step(s)</p>
      </header>
      <button
        id="run-btn"
        type="button"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Run
      </button>
      <pre
        id="log"
        class="mt-6 p-4 bg-gray-900 text-green-300 rounded text-xs overflow-x-auto min-h-[200px] whitespace-pre-wrap"
      ></pre>
      <script>{raw(clientScript)}</script>
    </Layout>
  );
}

function buildClientScript(slug: string): string {
  const safeSlug = encodeURIComponent(slug);
  return `
(function () {
  const btn = document.getElementById('run-btn');
  const log = document.getElementById('log');
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    log.textContent = '';
    let res;
    try {
      res = await fetch('/workflows/${safeSlug}/run', { method: 'POST' });
    } catch (e) {
      append('error: ' + e.message);
      btn.disabled = false;
      return;
    }
    if (!res.ok || !res.body) {
      append('error: HTTP ' + res.status);
      btn.disabled = false;
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let sep;
      while ((sep = buf.indexOf('\\n\\n')) !== -1) {
        const chunk = buf.slice(0, sep);
        buf = buf.slice(sep + 2);
        const dataLine = chunk.split('\\n').find((l) => l.startsWith('data: '));
        if (!dataLine) continue;
        try {
          const evt = JSON.parse(dataLine.slice(6));
          renderEvent(evt);
        } catch (_e) {
          append('parse error: ' + dataLine);
        }
      }
    }
    btn.disabled = false;
  });

  function renderEvent(evt) {
    if (evt.kind === 'run-start') {
      append('— starting workflow: ' + evt.workflowName);
    } else if (evt.kind === 'step-start') {
      append('▶ step ' + evt.index + ' (' + evt.step.type + ') starting');
    } else if (evt.kind === 'step-output') {
      append('  output: ' + truncate(evt.output, 500));
    } else if (evt.kind === 'step-end') {
      append('  ' + (evt.ok ? '✓' : '✗') + ' step ' + evt.index + (evt.error ? ' — ' + evt.error : ''));
    } else if (evt.kind === 'done') {
      append('— run complete (' + evt.runId + ')');
    } else {
      // Future-proof: log unknown event kinds for debugging, but with a
      // visible prefix so it's clear they're not part of the normal flow.
      append('(unknown event) ' + JSON.stringify(evt));
    }
  }

  function append(line) {
    const div = document.createElement('div');
    div.textContent = line;
    log.appendChild(div);
  }

  function truncate(s, n) {
    return s && s.length > n ? s.slice(0, n) + '…' : s;
  }
})();
`;
}
