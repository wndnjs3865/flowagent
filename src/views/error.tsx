import { Layout } from "./layout";

export function ErrorPage(props: {
  status: number;
  title: string;
  detail?: string;
}) {
  return (
    <Layout title={`${props.status} · ${props.title}`}>
      <div class="space-y-4">
        <header class="flex items-baseline justify-between">
          <h1 class="text-2xl font-bold">{props.title}</h1>
          <span class="text-sm text-gray-500">HTTP {props.status}</span>
        </header>
        {props.detail ? (
          <pre class="bg-gray-100 border border-gray-200 rounded p-3 text-sm whitespace-pre-wrap break-words">
            {props.detail}
          </pre>
        ) : null}
        <p>
          <a class="text-blue-600 hover:underline" href="/">
            ← Back to workflows
          </a>
        </p>
      </div>
    </Layout>
  );
}
