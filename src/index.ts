import { Scalar } from "@scalar/hono-api-reference";
import { notFound, onError } from "stoker/middlewares";
import { OpenAPIHono } from "@hono/zod-openapi";
import defaultHook from "stoker/openapi/default-hook";
import users from "./routes/users.index";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { JWT_SECRET } from "./routes/users.handlers";
import { decode, sign } from "hono/jwt";

const app = new OpenAPIHono<{ Bindings: Env }>({ strict: false, defaultHook });
app.notFound(notFound);
app.onError(onError);

app.route("/", users);

// vulnerabilty: literally everything in this endpoint shouldn't be in prod
app.get("/debug/jwt-details", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { error: "Missing or invalid Bearer token" },
      HttpStatusCodes.UNAUTHORIZED
    );
  }
  const token = authHeader.replace("Bearer ", "").trim();
  const decoded = decode(token);

  return c.json(
    {
      message: "Debug JWT details (do not expose in production!)",
      providedToken: token,
      decodedPayload: decoded.payload,
      decodedHeader: decoded.header,
      jwtSecret: JWT_SECRET, // vulnerability: exposes signing key
    },
    HttpStatusCodes.OK
  );
});

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
