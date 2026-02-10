"use client";

import { useSearchParams } from "next/navigation";
import { SignupForm } from "@/components/auth/login-form";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("token") || undefined;

  return <SignupForm inviteToken={inviteToken} />;
}
