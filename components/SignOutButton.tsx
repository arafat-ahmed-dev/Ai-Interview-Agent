"use client";

import React from "react";
import { signOut } from "@/lib/action/auth.action";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

const SignOutButton = () => {
    const router = useRouter();

    const handleSignOut = async () => {
        const result = await signOut();
        if (result.success) {
            toast.success("Successfully signed out!");
            router.push("/sign-in");
        } else {
            console.error(result.message);
        }
    };

    return (
        <button
            onClick={handleSignOut}
            className="text-sm pr-2 text-gray-500 cursor-pointer hover:text-gray-700"
        >
            <Image src={"/logout.png"} alt="signOut png" width={30} height={30} />
        </button>
    );
};

export default SignOutButton;