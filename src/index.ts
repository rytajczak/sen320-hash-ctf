import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/message", (c) => {
  return c.text("Ethan is super duper extraordinarily very exceptionally gay");
});

export default app;
