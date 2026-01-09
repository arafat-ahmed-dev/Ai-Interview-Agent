import { auth } from "@/firebase/client";
import { sendPasswordResetEmail, confirmPasswordReset } from "firebase/auth";

export async function forgotPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Password reset email sent successfully. Please check your inbox.",
    };
  } catch (e) {
    console.error("Error sending password reset email", e);
    return {
      success: false,
      message: "Failed to send password reset email. Please try again later.",
    };
  }
}

export async function resetPassword(oobCode: string, newPassword: string) {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
    return {
      success: true,
      message: "Password has been reset successfully. You can now log in.",
    };
  } catch (e) {
    console.error("Error resetting password", e);
    return {
      success: false,
      message: "Failed to reset password. Please try again later.",
    };
  }
}