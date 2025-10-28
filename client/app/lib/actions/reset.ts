"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Request a password reset email
 * POST /api/tokens/password-reset
 */
export const Reset = async (formData: FormData) => {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  try {
    const response = await fetch(`${API_URL}/api/tokens/password-reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Password reset request failed:", data);
      return { error: data.error || "Failed to send reset email" };
    }

    console.log("✅ Password reset email sent:", data);
    return { success: data.message || "Email sent successfully" };
  } catch (error) {
    console.error("❌ Error requesting password reset:", error);
    return { error: "An error occurred. Please try again." };
  }
};

/**
 * Reset password with token
 * POST /api/tokens/reset-password
 */
export const resetUserPassword = async (token: string, newPassword: string) => {
  if (!token || !newPassword) {
    return { error: "Token and password are required" };
  }

  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  try {
    const response = await fetch(`${API_URL}/api/tokens/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ token, password: newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Password reset failed:", data);
      return { error: data.error || "Failed to reset password" };
    }

    console.log("✅ Password reset successful:", data);
    return { success: data.message || "Password reset successfully" };
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    return { error: "An error occurred. Please try again." };
  }
};

/**
 * Verify if a reset token is valid
 * GET /api/tokens/verify-reset-token/:token
 */
export const verifyPasswordResetToken = async (token: string) => {
  if (!token) {
    return { valid: false, error: "Token is required" };
  }

  try {
    const response = await fetch(
      `${API_URL}/api/tokens/verify-reset-token/${token}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const data = await response.json();

    // Handle both success (200) and error (400) responses
    if (!response.ok) {
      const errorMessage = data?.error || "Invalid token";
      console.error("❌ Token verification failed:", errorMessage);
      return { valid: false, error: errorMessage };
    }

    // Check if token is valid in the response
    if (data?.valid === false) {
      const errorMessage = data?.error || "Invalid token";
      console.error("❌ Token invalid:", errorMessage);
      return { valid: false, error: errorMessage };
    }

    console.log("✅ Token verified:", data);
    return { valid: true, email: data.email };
  } catch (error) {
    console.error("❌ Error verifying token:", error);
    return { valid: false, error: "An error occurred while verifying token" };
  }
};

export default Reset;

export async function PasswordResetToken(token: string) {
  return verifyPasswordResetToken(token);
}
