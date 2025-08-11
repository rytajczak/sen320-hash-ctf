import { Hono } from "hono";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/message", (c) => {
  return c.text("Ethan is super duper extraordinarily very exceptionally gay");
});

app.get("/login", (c) => {
  return c.text("this will be a login page")
})


export default app;
