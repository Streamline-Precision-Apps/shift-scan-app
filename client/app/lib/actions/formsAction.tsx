"use server";
import prisma from "@/lib/prisma";

export async function generalFromSubmission(formData: FormData) {
  try {
    const formTemplateId = formData.get("formTemplateId") as string;
    const userId = formData.get("userId") as string;
    const dataString = formData.get("data") as string;
    const submittedAt = (formData.get("submittedAt") as string) || null;
    const jsonData = JSON.parse(dataString);

    const submission = await prisma.formSubmission.create({
      data: {
        formTemplateId,
        userId,
        data: jsonData,
        submittedAt,
      },
    });

    return submission;
  } catch (error) {
    console.error("Error creating form submission:", error);
    throw error;
  }
}
