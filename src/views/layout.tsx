import type { Child } from "hono/jsx";

export function Layout(props: { title: string; children: Child }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{props.title} · FlowAgent</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-50 text-gray-900 font-sans antialiased">
        <main class="max-w-3xl mx-auto p-6">{props.children}</main>
      </body>
    </html>
  );
}
