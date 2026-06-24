"use client";

import { useActionState, useState } from "react";
import { Leaf } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";
import { signIn, signUp, type AuthState } from "@/lib/auth/actions";

const EMPTY: AuthState = {};

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction, signInPending] = useActionState(
    signIn,
    EMPTY,
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUp,
    EMPTY,
  );

  const isSignin = mode === "signin";
  const state = isSignin ? signInState : signUpState;
  const action = isSignin ? signInAction : signUpAction;
  const pending = isSignin ? signInPending : signUpPending;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <span
            className="bg-accent-soft text-accent flex size-12 items-center justify-center rounded-2xl"
            aria-hidden
          >
            <Leaf className="size-6" strokeWidth={2} />
          </span>
          <h1 className="type-display text-foreground">DietLife</h1>
          <p className="type-caption text-muted">
            {isSignin ? "登入以同步你的飲控紀錄" : "建立帳號開始使用"}
          </p>
        </div>

        <Card size="lg">
          <form action={action} className="space-y-4">
            <Input
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              label="電子郵件"
              placeholder="you@example.com"
              required
            />
            <Input
              name="password"
              type="password"
              autoComplete={isSignin ? "current-password" : "new-password"}
              label="密碼"
              placeholder="至少 8 碼"
              minLength={8}
              required
            />

            {state.error && (
              <p className="text-danger type-caption" role="alert">
                {state.error}
              </p>
            )}
            {state.message && (
              <p className="text-success type-caption" role="status">
                {state.message}
              </p>
            )}

            <Button type="submit" fullWidth disabled={pending}>
              {pending ? "處理中…" : isSignin ? "登入" : "註冊"}
            </Button>
          </form>
        </Card>

        <button
          type="button"
          onClick={() => setMode(isSignin ? "signup" : "signin")}
          className="text-muted type-caption mt-4 block w-full text-center underline-offset-4 hover:underline"
        >
          {isSignin ? "還沒有帳號？註冊" : "已有帳號？登入"}
        </button>
      </div>
    </main>
  );
}
