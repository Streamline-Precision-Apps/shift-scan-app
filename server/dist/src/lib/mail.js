import { Resend } from "resend";
const resend = new Resend(process.env.AUTH_RESEND_KEY);
/**
 * Sends a password reset email to the specified address with the provided token.
 * Reports errors to Sentry and rethrows for upstream handling.
 * @param email - The recipient's email address
 * @param token - The password reset token
 */
export const sendPasswordResetEmail = async (email, token) => {
    try {
        const isProd = process.env.NODE_ENV === "production";
        const resetLink = isProd
            ? `https://shiftscanapp.com/signin/update-password?token=${token}`
            : `http://localhost:3000/signin/update-password?token=${token}`;
        console.log(`📧 Sending password reset email to: ${email}`);
        console.log(`🔗 Reset link: ${resetLink}`);
        await resend.emails.send({
            from: "no-reply@shiftscanapp.com",
            to: email,
            subject: "Reset your password",
            html: `
      <p>Hello,</p>
      <p>You have requested to reset your password. Please click the link below to set a new password:</p>
      <p><a href="${resetLink}" style="background-color: #003d99; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>Thank you,<br/>ShiftScan Team</p>
      `,
        });
        console.log(`✅ Password reset email sent to: ${email}`);
    }
    catch (error) {
        console.error("❌ Error sending password reset email:", error);
        throw error;
    }
};
//# sourceMappingURL=mail.js.map