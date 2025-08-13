import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

export const authSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(40, "Password must be at most 40 characters"),
});

export const register = createRoute({
  path: "/register",
  method: "post",
  request: {
    body: jsonContentRequired(authSchema, "User details"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      z.object({
        message: z.string(),
        username: z.string(),
        passwordHash: z.string(), // Vulnerability: exposed hash
        salt: z.string(), // Vulnerability: exposed salt
      }),
      "User created"
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      z.object({
        error: z.string(),
      }),
      "User already exists"
    ),
  },
});

export const login = createRoute({
  path: "/login",
  method: "post",
  request: {
    body: jsonContentRequired(authSchema, "User details"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        username: z.string(),
        passwordHash: z.string(), // Vulnerability: exposed hash
        token: z.string().describe("Bearer token for authentication"),
      }),
      "Successfully logged in"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({
        error: z.string(),
      }),
      "User doesn't exist"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      z.object({
        error: z.string(),
      }),
      "Incorrect password"
    ),
  },
});

export const passwordResetRequest = createRoute({
  path: "/password-reset/request",
  method: "post",
  request: {
    headers: z.object({
      authorization: z.string().describe("Bearer token from /login").openapi({
        example: "Bearer 4f3c2a1b9d8e7f6a5b4c3d2e1f0a9b8c",
      }),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        resetToken: z.string(), // Vulnerability: weak token
      }),
      "Password reset token generated"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({
        error: z.string(),
      }),
      "User not found"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        error: z.string(),
      }),
      "Missing or invalid Bearer token"
    ),
  },
});

export const passwordResetConfirm = createRoute({
  path: "/password-reset/confirm",
  method: "post",
  request: {
    headers: z.object({
      authorization: z.string().describe("Bearer token from /login").openapi({
        example: "Bearer 4f3c2a1b9d8e7f6a5b4c3d2e1f0a9b8c",
      }),
    }),
    body: jsonContentRequired(
      z.object({
        resetToken: z.string(),
        newPassword: z.string().min(8).max(40),
      }),
      "Password reset confirmation"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        newPasswordHash: z.string(), // Vulnerability: exposed new hash
      }),
      "Password updated successfully"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      z.object({
        error: z.string(),
      }),
      "Invalid or expired token"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        error: z.string(),
      }),
      "Missing or invalid Bearer token"
    ),
  },
});

export type RegisterRoute = typeof register;
export type LoginRoute = typeof login;
export type PasswordResetRequestRoute = typeof passwordResetRequest;
export type PasswordResetConfirmRoute = typeof passwordResetConfirm;
