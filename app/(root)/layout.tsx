import React from "react";
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated } from "@/lib/action/auth.action";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav className="root-layout__nav">
        <div className="flex justify-between items-center h-full">
          <Link href={"/"} className={"flex items-center gap-2"}>
            <Image src="/logo.svg" alt={"logo"} width={38} height={32} />
            <h2 className="text-primary-100">PrepWise</h2>
          </Link>
          {/* Use the Client Component for Sign Out */}
          <SignOutButton />
        </div>
      </nav>
      {children}
    </div>
  );
};

export default RootLayout;
