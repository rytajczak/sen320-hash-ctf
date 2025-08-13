import { Hono } from "hono";
import { compareHash, hashString } from "./util/hash";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/message", (c) => {
  return c.text("Ethan is super duper very exceptionally gay");
});

export default app;
