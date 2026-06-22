"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.name },
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <Card className="w-full text-center">
        <div className="size-16 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/30 flex items-center justify-center mx-auto mb-4">
          <Mail size={28} className="text-[var(--color-accent)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Check your email</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          We sent a confirmation link to your email. Click it to activate your account and start building your profile.
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Create your account</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Free forever. No credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Alex Johnson"
          leftIcon={<User size={14} />}
          error={errors.name?.message}
          {...register("name")}
        />

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
          autoComplete="new-password"
          placeholder="Min. 8 characters"
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

        <Input
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repeat your password"
          leftIcon={<Lock size={14} />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {serverError && (
          <p className="text-sm text-[var(--color-danger)] bg-[rgba(248,113,113,0.1)] border border-[var(--color-danger)]/20 rounded-[var(--radius-md)] px-3 py-2">
            {serverError}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} className="w-full mt-1">
          Create free account
        </Button>

        <p className="text-xs text-center text-[var(--color-text-muted)]">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      <p className="text-sm text-center text-[var(--color-text-muted)] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--color-accent)] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
