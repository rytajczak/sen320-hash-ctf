import { OpenAPIHono } from "@hono/zod-openapi";

import * as handlers from "./users.handlers";
import * as routes from "./users.routes";

const router = new OpenAPIHono<{ Bindings: Env }>()
  .openapi(routes.register, handlers.register)
  .openapi(routes.login, handlers.login)
  .openapi(routes.passwordResetRequest, handlers.passwordResetRequest)
  .openapi(routes.passwordResetConfirm, handlers.passwordResetConfirm);

export default router;
