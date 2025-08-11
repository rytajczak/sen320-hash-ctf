import { Hono } from "hono";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/message", (c) => {
  return c.text("Ethan is super duper very gay");
});

app.get("/admin", async (c) => {
  const adminHtml = await fetch("/public/admin.html").then(res => res.text());
  return c.html(adminHtml);
});

export default app;
