"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { credentialsSchema } from "@/lib/validation/schemas";
import { hashPassword, verifyPassword } from "./password";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "./session";

export interface AuthState {
  error?: string;
  message?: string;
}

async function setSessionCookie(id: string, username: string) {
  const token = await signSession({ id, username });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

function parse(formData: FormData) {
  return credentialsSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入無效" };
  }
  const username = parsed.data.username.toLowerCase();
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("app_users")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (existing) return { error: "這個帳號已被使用" };

  const password_hash = await hashPassword(parsed.data.password);
  const { data: created, error } = await admin
    .from("app_users")
    .insert({ username, password_hash })
    .select("id")
    .single();
  if (error || !created) return { error: "註冊失敗，請稍後再試" };

  // Create the matching profile row (was the auth trigger's job before).
  await admin.from("profiles").insert({ id: created.id });

  await setSessionCookie(created.id, username);
  redirect("/");
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入無效" };
  }
  const username = parsed.data.username.toLowerCase();
  const admin = createAdminClient();

  const { data: user } = await admin
    .from("app_users")
    .select("id, password_hash")
    .eq("username", username)
    .maybeSingle();

  // Don't reveal whether the username exists.
  if (
    !user ||
    !(await verifyPassword(parsed.data.password, user.password_hash))
  ) {
    return { error: "帳號或密碼錯誤" };
  }

  await setSessionCookie(user.id, username);
  redirect("/");
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
