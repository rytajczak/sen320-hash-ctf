import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/message", (c) => {
  return c.text("Ethan is super duper extraordinarily very exceptionally gay");
});

app.get("/admin", async (c) => {
  const adminHtml = await fetch("/public/admin.html").then(res => res.text());
  return c.html(adminHtml);
});

export default app;
