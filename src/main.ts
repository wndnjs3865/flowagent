import { serve } from "@hono/node-server";
import { app } from "./server";

const port = Number(process.env.PORT ?? "3000");

serve({ fetch: app.fetch, port }, ({ port }) => {
  console.log(`FlowAgent listening on http://localhost:${port}`);
});
