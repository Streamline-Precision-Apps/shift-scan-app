"use server";
import prisma from "@/lib/prisma";
import { Prisma } from "../../prisma/generated/prisma/client";
import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";

export async function getJobsiteForms() {
  try {
    const jobsiteForms = await prisma.jobsite.findMany();
    return jobsiteForms;
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error fetching jobsite forms:", error);
    throw error;
  }
}

// Check if jobsite exists
export async function jobExists(id: string) {
  try {
    const jobsite = await prisma.jobsite.findUnique({
      where: { id: id },
    });
    return jobsite;
  } catch (error) {
    console.error("Error checking if jobsite exists:", error);
    throw error;
  }
}

// Create jobsite
export async function createJobsite(formData: FormData) {
  const name = formData.get("temporaryJobsiteName") as string;
  const code = formData.get("code") as string;
  const createdById = formData.get("createdById") as string;
  const qrId = formData.get("qrCode") as string;
  const creationComment = formData.get("creationComment") as string;
  const creationReasoning = formData.get("creationReasoning") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const zipCode = formData.get("zipCode") as string;

  try {
    const data = await prisma.$transaction(async (prisma) => {
      // Check for duplicate jobsite name
      const existingJobsites = await prisma.jobsite.findMany({
        where: { name },
      });

      if (existingJobsites.length > 0) {
        throw new Error("A jobsite with the same name already exists.");
      }

      const data: Prisma.JobsiteCreateInput = {
        name,
        code,
        qrId,
        description: creationComment,
        creationReason: creationReasoning,
        approvalStatus: "PENDING",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
        CCTags: {
          connect: { id: "All" }, // Ensure 'All' tag is connected
        },
        createdBy: createdById ? { connect: { id: createdById } } : undefined,
      };

      if (address && city && state && zipCode) {
        // Try to find address first using findFirst for type safety
        let addr = await prisma.address.findFirst({
          where: {
            street: address,
            city,
            state,
            zipCode,
          },
        });
        if (!addr) {
          addr = await prisma.address.create({
            data: {
              street: address,
              city,
              state,
              zipCode,
            },
          });
        }
        if (addr) {
          data.Address = { connect: { id: addr.id } };
        }
      }

      // Create the jobsite and get the created record
      const jobsite = await prisma.jobsite.create({
        data,
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      revalidatePath("/dashboard/qr-generator");
      return jobsite;
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error creating jobsite:", error);
    throw error;
  }
}

// Delete jobsite by id
export async function deleteJobsite(id: string) {
  try {
    await prisma.jobsite.delete({
      where: { id: id },
    });
  } catch (error) {
    console.error("Error deleting jobsite:", error);
    throw error;
  }
}
