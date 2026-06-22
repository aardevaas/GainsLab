"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import type { Metadata } from "next";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError(
        error.message === "Invalid login credentials"
          ? "Email or password is incorrect"
          : error.message,
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Welcome back</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Sign in to continue your fitness journey
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          leftIcon={<Mail size={14} />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••"
          leftIcon={<Lock size={14} />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
          error={errors.password?.message}
          {...register("password")}
        />

        {serverError && (
          <p className="text-sm text-[var(--color-danger)] bg-[rgba(248,113,113,0.1)] border border-[var(--color-danger)]/20 rounded-[var(--radius-md)] px-3 py-2">
            {serverError}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} className="w-full mt-1">
          Sign in
        </Button>
      </form>

      <p className="text-sm text-center text-[var(--color-text-muted)] mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-[var(--color-accent)] hover:underline font-medium"
        >
          Create one free
        </Link>
      </p>
    </Card>
  );
}
