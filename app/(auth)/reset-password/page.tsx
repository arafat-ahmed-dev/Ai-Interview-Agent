"use client";

import React, { useState } from "react";
import { resetPassword } from "@/lib/action/client.auth.action";
import { useSearchParams } from "next/navigation";

const ResetPasswordPage = () => {
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const searchParams = useSearchParams();
    const oobCode = searchParams.get("oobCode");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oobCode) {
            setMessage("Invalid or missing reset code.");
            return;
        }
        const result = await resetPassword(oobCode, newPassword);
        setMessage(result.message);
    };

    return (
        <div className="reset-password-page">
            <h1>Reset Password</h1>
            <form onSubmit={handleSubmit} className="form">
                <input
                    type="password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="input"
                />
                <button type="submit" className="btn">
                    Reset Password
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResetPasswordPage;