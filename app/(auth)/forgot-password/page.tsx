"use client";

import { forgotPassword } from "@/lib/action/client.auth.action"
import React, { useState } from "react";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await forgotPassword(email);
        setMessage(result.message);
    };

    return (
        <div className="forgot-password-page">
            <h1>Forgot Password</h1>
            <form onSubmit={handleSubmit} className="form">
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input"
                />
                <button type="submit" className="btn">
                    Send Reset Email
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ForgotPasswordPage;