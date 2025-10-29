/**
 * Sends a password reset email to the specified address with the provided token.
 * Reports errors to Sentry and rethrows for upstream handling.
 * @param email - The recipient's email address
 * @param token - The password reset token
 */
export declare const sendPasswordResetEmail: (email: string, token: string) => Promise<void>;
//# sourceMappingURL=mail.d.ts.map