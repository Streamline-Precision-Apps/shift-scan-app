"use server";
import { sendPasswordResetEmail } from "@/lib/mail";
import prisma from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";

export const Reset = async (formData: FormData) => {
  const email = formData.get("email") as string;

  if (!email) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return { error: "Email not found" };
  }

  // check to make sure user gets a token if passed
  const passwordResetToken = await generatePasswordResetToken(email);
  // passes email and token to send an email out
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token,
  );

  return { success: "Email sent" };
};

export async function resetUserPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const newPassword = formData.get("password") as string;
  // Fetch the password reset token
  const verify = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!verify) {
    throw new Error("Invalid token");
  }

  // Ensure the token has not expired
  if (verify.expiration < new Date()) {
    throw new Error("Token expired");
  }

  // Fetch the user by email
  const user = await prisma.user.findUnique({
    where: { email: verify.email },
  });

  if (!user) {
    throw new Error("Invalid token");
  }

  // delete the token
  await prisma.passwordResetToken.delete({
    where: { id: verify.id },
  });

  // Update the user's password in the database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: newPassword,
    },
  });
}

export default async function removeToken(token: string) {
  await prisma.passwordResetToken.delete({
    where: { token },
  });
  return { success: "Token removed" };
}
