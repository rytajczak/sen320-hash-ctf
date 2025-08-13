import {
  LoginRoute,
  RegisterRoute,
  PasswordResetRequestRoute,
  PasswordResetConfirmRoute,
} from "./users.routes";
import { AppRouteHandler } from "../lib/types";
import { drizzle } from "drizzle-orm/d1";
import { users } from "../db/schema";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { eq } from "drizzle-orm";
import { sign, verify } from "hono/jwt";
import { generateSalt, hashPassword } from "../util/crypto";

// Vulnerability: non secure jwt secret
const jwtSecret = "ethanisgaylmao";

export const register: AppRouteHandler<RegisterRoute> = async (c) => {
  const { username, password } = c.req.valid("json");
  const db = drizzle(c.env.DB);

  const salt = generateSalt(username);
  const passwordHash = hashPassword(password, salt);

  const user = await db
    .insert(users)
    .values({
      username,
      passwordHash,
      salt,
    })
    .onConflictDoNothing({ target: users.username })
    .returning()
    .get();

  if (!user) {
    return c.json({ error: "Username taken" }, HttpStatusCodes.CONFLICT);
  }

  return c.json(
    {
      message: "User created successfully",
      username: user.username,
      passwordHash: user.passwordHash, // Vulnerability: exposing hash
      salt: user.salt, // Vulnerability: exposing salt
    },
    HttpStatusCodes.CREATED
  );
};

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const { username, password } = c.req.valid("json");
  const db = drizzle(c.env.DB);

  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .get();

  if (!user) {
    return c.json({ error: "User not found" }, HttpStatusCodes.NOT_FOUND);
  }

  const salt = generateSalt(username);
  const passwordHash = hashPassword(password, salt);

  if (user.passwordHash !== passwordHash) {
    return c.json({ error: "Incorrect password" }, HttpStatusCodes.FORBIDDEN);
  }

  const token = await sign({ username }, jwtSecret);

  return c.json(
    {
      message: "Login successful",
      username: user.username,
      passwordHash: user.passwordHash, // Vulnerability: exposing hash
      token,
    },
    HttpStatusCodes.OK
  );
};

export const passwordResetRequest: AppRouteHandler<
  PasswordResetRequestRoute
> = async (c) => {
  const authHeader = c.req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { error: "Missing or invalid Bearer token" },
      HttpStatusCodes.UNAUTHORIZED
    );
  }

  const token = authHeader.replace("Bearer ", "").trim();
  let decoded: any;
  try {
    decoded = await verify(token, jwtSecret);
  } catch {
    return c.json(
      { error: "Invalid Bearer token" },
      HttpStatusCodes.UNAUTHORIZED
    );
  }

  const username = decoded.username;

  const db = drizzle(c.env.DB);
  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .get();

  if (!user) {
    return c.json({ error: "User not found" }, HttpStatusCodes.NOT_FOUND);
  }

  // Vulnerability: weak reset token
  const resetToken = `${username}_${Date.now()}`;

  return c.json(
    {
      message: "Password reset token generated",
      resetToken,
    },
    HttpStatusCodes.OK
  );
};

export const passwordResetConfirm: AppRouteHandler<
  PasswordResetConfirmRoute
> = async (c) => {
  const authHeader = c.req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { error: "Missing or invalid Bearer token" },
      HttpStatusCodes.UNAUTHORIZED
    );
  }

  const token = authHeader.replace("Bearer ", "").trim();
  let decoded: any;
  try {
    decoded = await verify(token, jwtSecret);
  } catch {
    return c.json(
      { error: "Invalid Bearer token" },
      HttpStatusCodes.UNAUTHORIZED
    );
  }

  const { resetToken, newPassword } = c.req.valid("json");
  const username = decoded.username;

  if (!resetToken.startsWith(username)) {
    return c.json(
      { error: "Invalid or expired token" },
      HttpStatusCodes.FORBIDDEN
    );
  }

  const db = drizzle(c.env.DB);
  const salt = generateSalt(username);
  const newPasswordHash = hashPassword(newPassword, salt);

  await db
    .update(users)
    .set({ passwordHash: newPasswordHash })
    .where(eq(users.username, username))
    .run();

  return c.json(
    {
      message: "Password updated successfully",
      newPasswordHash, // Vulnerability: exposing new hash
    },
    HttpStatusCodes.OK
  );
};
