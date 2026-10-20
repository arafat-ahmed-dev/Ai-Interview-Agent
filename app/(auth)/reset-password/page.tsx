"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { resetPassword } from "@/lib/action/client.auth.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oobCode) {
      toast.error("Invalid or missing reset code. Please request a new link.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(oobCode, newPassword);
      if (result.success) {
        setIsSuccess(true);
        toast.success(result.message);
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-border lg:min-w-[566px] w-full max-w-lg">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center items-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">PrepWise</h2>
        </div>
        <h3 className="text-center">Choose New Password</h3>

        {!oobCode ? (
          <div className="space-y-4 text-center">
            <p className="text-destructive-100">
              Invalid or expired password reset link.
            </p>
            <Button className="btn w-full" asChild>
              <Link href="/forgot-password">Request New Reset Link</Link>
            </Button>
          </div>
        ) : isSuccess ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-dark-200 border border-success-100/30 text-success-100 text-sm">
              Password updated successfully! Redirecting you to sign in...
            </div>
            <Button className="btn w-full" asChild>
              <Link href="/sign-in">Go to Sign In</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-6 mt-4 form">
            <div className="space-y-2">
              <label className="text-sm font-medium text-light-100">
                New Password
              </label>
              <Input
                type="password"
                placeholder="Enter new password (min. 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
                className="input"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-light-100">
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="input"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="btn flex items-center justify-center"
            >
              {isLoading ? "Updating Password..." : "Reset Password"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm">
          <Link
            href="/sign-in"
            className="font-bold text-primary-200 hover:underline"
          >
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense
      fallback={
        <div className="card-border lg:min-w-[566px] w-full max-w-lg">
          <div className="flex flex-col gap-6 card py-14 px-10 text-center text-light-100">
            Loading...
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPasswordPage;