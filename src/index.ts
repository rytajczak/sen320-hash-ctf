import { Scalar } from "@scalar/hono-api-reference";
import { notFound, onError } from "stoker/middlewares";
import { OpenAPIHono } from "@hono/zod-openapi";
import defaultHook from "stoker/openapi/default-hook";
import users from "./routes/users.index";

const app = new OpenAPIHono<{ Bindings: Env }>({ strict: false, defaultHook });
app.notFound(notFound);
app.onError(onError);

app.get("/message", (c) => {
  return c.text("Ethan is super duper extraordinarily very exceptionally gay");
});

app.route("/", users);

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "Hash vulnerability Capture-The-Flag API",
    version: "1.0.0",
    description:
      "This API simulates a legacy, insecure authentication system for educational and training purposes. It is intentionally designed with multiple known vulnerabilities to allow security teams to practice vulnerability discovery, exploitation, and remediation in a controlled environment. The system provides basic user registration, login, and password reset functionality, but implements outdated and unsafe security practices.",
  },
  servers: [
    {
      url: "https://sen320-hash-ctf.ryantratajczak.workers.dev",
      description: "Prod Server",
    },
    {
      url: "http://localhost:8787",
      description: "Local Server",
    },
  ],
});
app.get("/", Scalar({ url: "/doc", theme: "kepler" }));

export default app;
