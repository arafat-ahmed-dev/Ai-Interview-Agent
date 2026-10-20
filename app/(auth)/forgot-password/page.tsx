"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { forgotPassword } from "@/lib/action/client.auth.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sentMessage, setSentMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setSentMessage(result.message);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
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
        <h3 className="text-center">Reset Your Password</h3>
        <p className="text-center text-sm text-light-100">
          Enter your account email and we will send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6 mt-4 form">
          <div className="space-y-2">
            <label className="text-sm font-medium text-light-100">Email Address</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {isLoading ? "Sending Link..." : "Send Reset Link"}
          </Button>
        </form>

        {sentMessage && (
          <div className="p-4 rounded-xl bg-dark-200 border border-primary-200/30 text-sm text-primary-100 text-center">
            {sentMessage}
          </div>
        )}

        <p className="text-center text-sm">
          Remember your password?
          <Link
            href="/sign-in"
            className="font-bold text-primary-200 hover:underline ml-1"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;