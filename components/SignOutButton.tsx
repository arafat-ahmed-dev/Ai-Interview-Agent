"use client";

import React, { useState } from "react";
import { signOut as serverSignOut } from "@/lib/action/auth.action";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

const SignOutButton = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.warn("Client auth signout warning:", err);
      }

      const result = await serverSignOut();
      if (result.success) {
        toast.success("Successfully signed out!");
        router.push("/sign-in");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to sign out.");
      }
    } catch (e) {
      console.error("Sign out error:", e);
      toast.error("An unexpected error occurred while signing out.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      aria-label="Sign out"
      title="Sign out"
      className="text-sm pr-2 text-gray-500 cursor-pointer hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
    >
      <Image
        src="/logout.png"
        alt="Sign out"
        width={30}
        height={30}
        className={isLoading ? "animate-pulse opacity-50" : ""}
      />
    </button>
  );
};

export default SignOutButton;