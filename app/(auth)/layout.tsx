import React from "react";
import { isAuthenticated } from "@/lib/action/auth.action";
import { redirect } from "next/navigation";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const isUerAuthenticated = await isAuthenticated();
  if (isUerAuthenticated) redirect("/");
  return <div className="auth-layout">{children}</div>;
};

export default AuthLayout;
