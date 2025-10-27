"use server";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  EquipmentTags,
  ApprovalStatus,
  CreatedVia,
  EquipmentState,
  FormTemplateStatus,
} from "../../prisma/generated/prisma/client";
import * as Sentry from "@sentry/nextjs";
import {
  Prisma,
  Condition,
  OwnershipType,
} from "../../prisma/generated/prisma/client";
import { auth } from "@/auth";

/**
 * Server action to update equipment asset data
 * Handles both basic equipment data and vehicle information
 */
export async function updateEquipmentAsset(formData: FormData) {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      throw new Error("Equipment ID is required");
    }

    const updateData: Prisma.EquipmentUpdateInput = {};

    // Process all possible equipment fields
    if (formData.has("name"))
      updateData.name = (formData.get("name") as string)?.trim();
    if (formData.has("code"))
      updateData.code = (formData.get("code") as string)?.trim();
    if (formData.has("description"))
      updateData.description =
        (formData.get("description") as string)?.trim() || "";
    if (formData.has("memo"))
      updateData.memo = (formData.get("memo") as string)?.trim();
    if (formData.has("equipmentTag"))
      updateData.equipmentTag = formData.get("equipmentTag") as EquipmentTags;
    if (formData.has("state"))
      updateData.state = formData.get("state") as EquipmentState;
    if (formData.has("status"))
      updateData.status = formData.get("status") as FormTemplateStatus;
    if (formData.has("ownershipType"))
      updateData.ownershipType =
        (formData.get("ownershipType") as OwnershipType) || null;
    if (formData.has("acquiredCondition"))
      updateData.acquiredCondition =
        (formData.get("acquiredCondition") as Condition) || null;
    if (formData.has("serialNumber"))
      updateData.serialNumber = (
        formData.get("serialNumber") as string
      )?.trim();
    if (formData.has("color"))
      updateData.color = (formData.get("color") as string)?.trim();

    // Vehicle/equipment specific fields that are now directly in the Equipment model
    if (formData.has("make"))
      updateData.make = (formData.get("make") as string)?.trim();
    if (formData.has("model"))
      updateData.model = (formData.get("model") as string)?.trim();
    if (formData.has("year"))
      updateData.year = (formData.get("year") as string)?.trim();
    if (formData.has("licensePlate"))
      updateData.licensePlate = (
        formData.get("licensePlate") as string
      )?.trim();
    if (formData.has("licenseState"))
      updateData.licenseState = (
        formData.get("licenseState") as string
      )?.trim();

    // Handle date fields
    if (formData.has("acquiredDate")) {
      const dateValue = formData.get("acquiredDate") as string;
      updateData.acquiredDate = dateValue ? new Date(dateValue) : null;
    }

    if (formData.has("registrationExpiration")) {
      const regExpValue = formData.get("registrationExpiration") as string;
      if (
        regExpValue &&
        regExpValue !== "null" &&
        regExpValue !== "undefined"
      ) {
        updateData.registrationExpiration = new Date(regExpValue);
      } else {
        updateData.registrationExpiration = null;
      }
    }

    // Handle numeric fields
    if (formData.has("currentWeight")) {
      const weightValue = formData.get("currentWeight") as string;
      updateData.currentWeight = weightValue ? parseFloat(weightValue) || 0 : 0;
    }

    // Handle boolean fields
    if (formData.has("overWeight")) {
      const overWeightValue = formData.get("overWeight") as string;
      updateData.overWeight = overWeightValue === "true";
    }
    if (formData.has("status")) {
      const disabledValue = formData.get("status") as string;
      updateData.status = disabledValue as FormTemplateStatus;
    }

    // Handle status fields
    if (formData.has("approvalStatus"))
      updateData.approvalStatus = formData.get(
        "approvalStatus",
      ) as ApprovalStatus;
    if (formData.has("creationReason"))
      updateData.creationReason = formData.get("creationReason") as string;

    // Always update the timestamp
    updateData.updatedAt = new Date();

    const updatedEquipment = await prisma.equipment.update({
      where: { id },
      data: updateData,
    });

    const notification = await prisma.notification.findMany({
      where: {
        topic: "items",
        referenceId: id.toString(),
        Response: {
          is: null,
        },
      },
    });
    if (notification.length > 0) {
      const session = await auth();
      if (!session?.user) {
        return {
          success: false,
          message: "User not authenticated",
        };
      }
      const userId = session.user.id;

      // Wrap notificationRead and notificationResponse createMany in a transaction
      await prisma.$transaction([
        prisma.notificationRead.createMany({
          data: notification.map((n) => ({
            notificationId: n.id,
            userId,
            readAt: new Date(),
          })),
        }),
        prisma.notificationResponse.createMany({
          data: notification.map((n) => ({
            notificationId: n.id,
            userId,
            response: "Approved",
            respondedAt: new Date(),
          })),
        }),
      ]);
    }

    revalidateTag("equipment");
    revalidateTag("assets");
    revalidatePath("/admins/assets");
    revalidatePath(`/admins/assets/${id}`);
    revalidatePath("/admins/equipment");
    return {
      success: true,
      data: updatedEquipment,
      message: "Equipment updated successfully",
    };
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error updating equipment:", error);
    throw new Error(
      `Failed to update equipment: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

export async function registerEquipment(
  equipmentData: {
    code: string;
    name: string;
    description?: string;
    memo?: string;
    ownershipType?: string | null;
    make?: string | null;
    model?: string | null;
    year?: string | null;
    color?: string | null;
    serialNumber?: string | null;
    acquiredDate?: Date | null;
    acquiredCondition?: string | null;
    licensePlate?: string | null;
    licenseState?: string | null;
    equipmentTag: string;
    status?: string;
    state?: string;
    approvalStatus?: string;
    isDisabledByAdmin?: boolean;
    overWeight: boolean | null;
    currentWeight: number | null;
  },
  createdById: string,
) {
  try {
    // Validate required fields
    if (!equipmentData.name.trim()) {
      throw new Error("Equipment name is required.");
    }

    if (!equipmentData.equipmentTag) {
      throw new Error("Please select an equipment tag.");
    }

    // Generate QR ID for new equipment
    const qrId = `EQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create equipment with flattened structure (no nested vehicle info)
    const result = await prisma.equipment.create({
      data: {
        qrId,
        code: equipmentData.code || "",
        name: equipmentData.name,
        description: equipmentData.description || "",
        memo: equipmentData.memo || "",
        ownershipType: (equipmentData.ownershipType as OwnershipType) || null,
        acquiredDate: equipmentData.acquiredDate,
        acquiredCondition:
          (equipmentData.acquiredCondition as Condition) || null,
        equipmentTag: equipmentData.equipmentTag as EquipmentTags,
        state: (equipmentData.state as EquipmentState) || "AVAILABLE",
        approvalStatus:
          (equipmentData.approvalStatus as ApprovalStatus) || "APPROVED",
        status: (equipmentData.status as FormTemplateStatus) || "ACTIVE",
        overWeight: equipmentData.overWeight || false,
        currentWeight: equipmentData.currentWeight || 0,
        createdById,
        // Add vehicle-specific fields directly to the equipment
        make: equipmentData.make,
        model: equipmentData.model,
        year: equipmentData.year,
        color: equipmentData.color,
        serialNumber: equipmentData.serialNumber,
        licensePlate: equipmentData.licensePlate,
        licenseState: equipmentData.licenseState,
      },
    });

    revalidatePath("/admins/assets");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error registering equipment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Server action to update equipment asset data
 * Handles both basic jobsite data and vehicle information
 */
export async function updateJobsiteAdmin(formData: FormData) {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      throw new Error("Jobsite ID is required");
    }

    const updateData: Prisma.JobsiteUpdateInput = {};
    if (formData.has("code")) {
      updateData.code = (formData.get("code") as string)?.trim();
    }
    if (formData.has("name")) {
      const code = (formData.get("code") as string)?.trim();
      const name = (formData.get("name") as string)?.trim();
      updateData.name = `${code} - ${name}`;
    }
    if (formData.has("description")) {
      updateData.description =
        (formData.get("description") as string)?.trim() || "";
    }
    if (formData.has("approvalStatus")) {
      updateData.approvalStatus = formData.get(
        "approvalStatus",
      ) as ApprovalStatus;
    }
    if (formData.has("status")) {
      updateData.status = formData.get("status") as FormTemplateStatus;
    }
    if (formData.has("creationReason")) {
      updateData.creationReason = formData.get("creationReason") as string;
    }
    if (formData.has("updatedAt")) {
      const updatedAt = formData.get("updatedAt");
      updateData.updatedAt =
        updatedAt && updatedAt !== "null" && updatedAt !== "undefined"
          ? new Date(updatedAt as string)
          : new Date();
    } else {
      updateData.updatedAt = new Date();
    }
    if (formData.has("CCTags")) {
      const cCTagsString = formData.get("CCTags") as string;
      const cCTagsArray = JSON.parse(cCTagsString || "[]");
      updateData.CCTags = {
        set: cCTagsArray.map((tag: { id: string }) => ({ id: tag.id })),
      };
    }

    const updatedJobsite = await prisma.jobsite.update({
      where: { id },
      data: updateData,
      include: { CCTags: true },
    });

    const notification = await prisma.notification.findMany({
      where: {
        topic: "items",
        referenceId: id.toString(),
        Response: {
          is: null,
        },
      },
    });
    if (notification.length > 0) {
      const session = await auth();
      if (!session?.user) {
        return {
          success: false,
          message: "User not authenticated",
        };
      }
      const userId = session.user.id;

      // Wrap notificationRead and notificationResponse createMany in a transaction
      await prisma.$transaction([
        prisma.notificationRead.createMany({
          data: notification.map((n) => ({
            notificationId: n.id,
            userId,
            readAt: new Date(),
          })),
        }),
        prisma.notificationResponse.createMany({
          data: notification.map((n) => ({
            notificationId: n.id,
            userId,
            response: "Approved",
            respondedAt: new Date(),
          })),
        }),
      ]);
    }

    revalidatePath("/admins/jobsites");
    return {
      success: true,
      data: updatedJobsite,
      message: "Jobsite updated successfully",
    };
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error updating jobsite:", error);
    throw new Error(
      `Failed to update jobsite: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}
/**
 * Alternative function for creating jobsite that accepts a structured object
 * Useful for direct TypeScript integration with forms
 */

export async function createJobsiteAdmin({
  payload,
}: {
  payload: {
    code: string;
    name: string;
    description: string;
    ApprovalStatus: string;
    status: string;
    Address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    Client?: {
      id: string;
    } | null;
    CCTags?: Array<{ id: string }>;
    CreatedVia: string;
    createdById: string;
  };
}) {
  try {
    await prisma.$transaction(async (prisma) => {
      const existingAddress = await prisma.address.findFirst({
        where: {
          street: payload.Address.street.trim(),
          city: payload.Address.city.trim(),
          state: payload.Address.state.trim(),
          zipCode: payload.Address.zipCode.trim(),
        },
      });

      if (existingAddress) {
        await prisma.jobsite.create({
          data: {
            code: payload.code.trim(),
            name: `${payload.code.trim()} - ${payload.name.trim()}`,
            description: payload.description.trim(),
            approvalStatus: payload.ApprovalStatus as ApprovalStatus,
            status: payload.status as FormTemplateStatus,
            createdVia: payload.CreatedVia as CreatedVia,
            Address: {
              connect: { id: existingAddress.id },
            },
            ...(payload.Client?.id && {
              Client: {
                connect: { id: payload.Client.id },
              },
            }),
            ...(payload.CCTags &&
              payload.CCTags.length > 0 && {
                CCTags: {
                  connect: payload.CCTags.map((tag) => ({ id: tag.id })),
                },
              }),
            createdBy: {
              connect: { id: payload.createdById.trim() },
            },
          },
        });
      } else {
        await prisma.jobsite.create({
          data: {
            code: payload.code.trim(),
            name: `${payload.code.trim()} - ${payload.name.trim()}`,
            description: payload.description.trim(),
            approvalStatus: payload.ApprovalStatus as ApprovalStatus,
            status: payload.status as FormTemplateStatus,
            createdVia: payload.CreatedVia as CreatedVia,
            Address: {
              create: {
                street: payload.Address.street.trim(),
                city: payload.Address.city.trim(),
                state: payload.Address.state.trim(),
                zipCode: payload.Address.zipCode.trim(),
              },
            },
            ...(payload.Client?.id && {
              Client: {
                connect: { id: payload.Client.id },
              },
            }),
            ...(payload.CCTags &&
              payload.CCTags.length > 0 && {
                CCTags: {
                  connect: payload.CCTags.map((tag) => ({ id: tag.id })),
                },
              }),
            createdBy: {
              connect: { id: payload.createdById.trim() },
            },
          },
        });
      }
    });

    return {
      success: true,
      message: "Jobsite created successfully",
    };
  } catch (error) {
    console.error("Error creating jobsite:", error);
    throw error;
  }
}

export async function deleteJobsite(id: string) {
  try {
    await prisma.jobsite.delete({
      where: { id },
    });

    // Revalidate relevant paths and tags
    revalidateTag("jobsites");
    revalidateTag("assets");
    revalidatePath("/admins/assets");
    revalidatePath("/admins/jobsites");

    return { success: true, message: "Jobsite deleted successfully" };
  } catch (error) {
    console.error("Error deleting jobsite:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function archiveJobsite(id: string) {
  try {
    await prisma.jobsite.update({
      where: { id },
      data: {
        status: "ARCHIVED",
      },
    });

    // Revalidate relevant paths and tags
    revalidateTag("jobsites");
    revalidateTag("assets");
    revalidatePath("/admins/assets");
    revalidatePath("/admins/jobsites");

    return { success: true, message: "Jobsite archived successfully" };
  } catch (error) {
    console.error("Error archiving jobsite:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function restoreJobsite(id: string) {
  try {
    await prisma.jobsite.update({
      where: { id },
      data: {
        status: "ACTIVE",
      },
    });

    // Revalidate relevant paths and tags
    revalidateTag("jobsites");
    revalidateTag("assets");
    revalidatePath("/admins/assets");
    revalidatePath("/admins/jobsites");

    return { success: true, message: "Jobsite restored successfully" };
  } catch (error) {
    console.error("Error restoring jobsite:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Server action to delete an equipment asset
 * @param id The ID of the equipment to delete
 * @returns Success status and message
 */
export async function deleteEquipment(id: string) {
  try {
    // Check if equipment exists
    const existingEquipment = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!existingEquipment) {
      throw new Error("Equipment not found");
    }

    // Delete the equipment (this will cascade to related records like equipmentVehicleInfo)
    await prisma.equipment.delete({
      where: { id },
    });

    // Revalidate relevant paths and tags
    revalidateTag("equipment");
    revalidateTag("assets");
    revalidatePath("/admins/assets");

    return { success: true, message: "Equipment deleted successfully" };
  } catch (error) {
    console.error("Error deleting equipment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function archiveEquipment(id: string) {
  try {
    await prisma.equipment.update({
      where: { id },
      data: {
        status: "ARCHIVED",
      },
    });
  } catch (error) {
    console.error("Error archiving equipment:", error);
  }
}

export async function restoreEquipment(id: string) {
  try {
    await prisma.equipment.update({
      where: { id },
      data: {
        status: "ACTIVE",
      },
    });
  } catch (error) {
    console.error("Error restoring equipment:", error);
  }
}

/**
 * Server action to create a new cost code
 */
export async function updateCostCodeAdmin(formData: FormData) {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      throw new Error("Jobsite ID is required");
    }

    // Fetch existing jobsite early
    const existingJobsite = await prisma.costCode.findUnique({
      where: { id },
      include: {
        CCTags: {
          select: { id: true, name: true },
        },
      },
    });

    if (!existingJobsite) {
      throw new Error("Jobsite not found");
    }

    const updateData: Prisma.CostCodeUpdateInput = {};
    if (formData.has("code")) {
      updateData.code = (formData.get("code") as string)?.trim();
    }
    if (formData.has("name")) {
      updateData.name = (formData.get("name") as string)?.trim();
    }
    if (formData.has("isActive")) {
      updateData.isActive = formData.get("isActive") === "true";
    }

    if (formData.has("cCTags")) {
      const cCTagsString = formData.get("cCTags") as string;
      let cCTagsArray = JSON.parse(cCTagsString || "[]");
      // If no tags provided, add the 'All' tag automatically
      if (!Array.isArray(cCTagsArray) || cCTagsArray.length === 0) {
        // Find the 'All' tag in the database
        const allTag = await prisma.cCTag.findFirst({
          where: { name: { equals: "All", mode: "insensitive" } },
          select: { id: true },
        });
        if (allTag) {
          cCTagsArray = [{ id: allTag.id }];
        }
      }
      updateData.CCTags = {
        set: cCTagsArray.map((tag: { id: string }) => ({ id: tag.id })),
      };
    }

    updateData.updatedAt = new Date();

    const updatedCostCode = await prisma.costCode.update({
      where: { id },
      data: updateData,
      include: { CCTags: true },
    });

    revalidatePath("/admins/cost-codes");
    return {
      success: true,
      data: updatedCostCode,
      message: "Cost code updated successfully",
    };
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error updating jobsite:", error);
    throw new Error(
      `Failed to update jobsite: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

export async function createCostCode(payload: {
  code: string;
  name: string;
  isActive: boolean;
  CCTags: {
    id: string;
    name: string;
  }[];
}) {
  try {
    // Validate required fields
    if (!payload.name?.trim()) {
      throw new Error("Cost code name is required");
    }

    // Check if cost code with the same name already exists
    const existingCostCode = await prisma.costCode.findFirst({
      where: {
        OR: [{ code: payload.code.trim() }, { name: payload.name.trim() }],
      },
    });

    if (existingCostCode) {
      throw new Error("A cost code with this name already exists");
    }

    // Create the new cost code
    const newCostCode = await prisma.costCode.create({
      data: {
        code: payload.code.trim(), // Use the code as-is (without #)
        name: payload.name.trim(), // Use the name as-is (already formatted as "#code name")
        isActive: payload.isActive,
        CCTags: {
          connect: payload.CCTags?.map((tag) => ({ id: tag.id })) || [],
        },
      },
    });

    // Revalidate relevant paths and tags
    revalidateTag("costcodes");
    revalidateTag("assets");
    revalidatePath("/admins/assets");

    return {
      success: true,
      data: newCostCode,
      message: "Cost code created successfully",
    };
  } catch (error) {
    console.error("Error creating cost code:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Server action to delete a cost code
 */
export async function deleteCostCode(id: string) {
  try {
    // Check for related records before deletion
    const costCodeWithRelations = await prisma.costCode.findUnique({
      where: { id },
      include: {
        Timesheets: true,
        CCTags: true,
      },
    });

    if (!costCodeWithRelations) {
      throw new Error("Cost code not found");
    }

    // Check if cost code is in use
    if (costCodeWithRelations.Timesheets.length > 0) {
      throw new Error("Cannot delete cost code that is used in timesheets");
    }

    // Disconnect any related CCTags before deletion
    if (costCodeWithRelations.CCTags.length > 0) {
      await prisma.costCode.update({
        where: { id },
        data: {
          CCTags: {
            disconnect: costCodeWithRelations.CCTags.map((tag) => ({
              id: tag.id,
            })),
          },
        },
      });
    }

    // Delete the cost code
    await prisma.costCode.delete({
      where: { id },
    });

    // Revalidate relevant paths and tags
    revalidateTag("costcodes");
    revalidateTag("assets");
    revalidatePath("/admins/assets");

    return {
      success: true,
      message: "Cost code deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting cost code:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
export async function archiveCostCode(id: string) {
  try {
    await prisma.costCode.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  } catch (error) {
    console.error("Error archiving cost code:", error);
  }
}

export async function restoreCostCode(id: string) {
  try {
    await prisma.costCode.update({
      where: { id },
      data: {
        isActive: true,
      },
    });
  } catch (error) {
    console.error("Error restoring cost code:", error);
  }
}

export async function updateTagAdmin(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    if (!id) {
      throw new Error("Tag ID is required");
    }

    // Fetch existing tag early
    const existingTag = await prisma.cCTag.findUnique({
      where: { id },
      include: {
        Jobsites: { select: { id: true, name: true } },
        CostCodes: { select: { id: true, name: true } },
      },
    });
    if (!existingTag) {
      throw new Error("Tag not found");
    }

    const updateData: Prisma.CCTagUpdateInput = {};
    if (formData.has("name")) {
      updateData.name = (formData.get("name") as string)?.trim();
    }
    if (formData.has("description")) {
      updateData.description =
        (formData.get("description") as string)?.trim() || "";
    }

    // Handle Jobsites relation
    if (formData.has("Jobsites")) {
      const jobsitesString = formData.get("Jobsites") as string;
      const jobsitesArray = JSON.parse(jobsitesString || "[]");
      updateData.Jobsites = {
        set: jobsitesArray.map((id: string) => ({ id })),
      };
    }

    // Handle CostCodes relation
    if (formData.has("CostCodeTags")) {
      const costCodesString = formData.get("CostCodeTags") as string;
      const costCodesArray = JSON.parse(costCodesString || "[]");
      updateData.CostCodes = {
        set: costCodesArray.map((id: string) => ({ id })),
      };
    }

    const updatedTag = await prisma.cCTag.update({
      where: { id },
      data: updateData,
      include: {
        Jobsites: { select: { id: true, name: true } },
        CostCodes: { select: { id: true, name: true } },
      },
    });

    revalidatePath("/admins/cost-codes");

    return {
      success: true,
      data: updatedTag,
      message: "Tag updated successfully",
    };
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error updating tag:", error);
    throw new Error(
      `Failed to update tag: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Server action to delete a tag
 *
 * @param id - The ID of the tag to delete
 * @returns Results object with success status and optional error message
 */
export async function deleteTag(id: string) {
  try {
    // Check if the tag exists before attempting to delete
    const existingTag = await prisma.cCTag.findUnique({
      where: { id },
      include: {
        CostCodes: {
          select: { id: true },
        },
      },
    });

    if (!existingTag) {
      return {
        success: false,
        error: "Tag not found",
      };
    }

    // Delete the tag
    await prisma.cCTag.delete({
      where: { id },
    });

    // Revalidate relevant paths and tags
    revalidateTag("costcodes");
    revalidateTag("assets");
    revalidatePath("/admins/assets");

    return {
      success: true,
      message: "Tag deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting tag:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function createTag(payload: {
  name: string;
  description: string;
  CostCode: {
    id: string;
    name: string;
  }[];
  Jobsites: {
    id: string;
    name: string;
  }[];
}) {
  try {
    // Validate required fields
    if (!payload.name?.trim()) {
      throw new Error("Tag name is required");
    }

    if (!payload.description?.trim()) {
      throw new Error("Tag description is required");
    }

    if (!payload.CostCode || payload.CostCode.length === 0) {
      throw new Error("At least one cost code must be selected");
    }

    // Check if tag with the same name already exists
    const existingTag = await prisma.cCTag.findUnique({
      where: {
        name: payload.name.trim(),
      },
    });

    if (existingTag) {
      throw new Error("A tag with this name already exists");
    }

    // Validate that all provided cost codes exist
    const existingCostCodes = await prisma.costCode.findMany({
      where: {
        id: {
          in: payload.CostCode.map((cc) => cc.id),
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (existingCostCodes.length !== payload.CostCode.length) {
      throw new Error("One or more selected cost codes do not exist");
    }

    // Validate that all provided jobsites exist (optional, but recommended)
    if (payload.Jobsites && payload.Jobsites.length > 0) {
      const existingJobsites = await prisma.jobsite.findMany({
        where: {
          id: {
            in: payload.Jobsites.map((js) => js.id),
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (existingJobsites.length !== payload.Jobsites.length) {
        throw new Error("One or more selected jobsites do not exist");
      }
    }

    // Create the new tag with associated cost codes and jobsites
    const newTag = await prisma.cCTag.create({
      data: {
        name: payload.name.trim(),
        description: payload.description.trim(),
        CostCodes: {
          connect: payload.CostCode.map((cc) => ({ id: cc.id })),
        },
        Jobsites:
          payload.Jobsites && payload.Jobsites.length > 0
            ? {
                connect: payload.Jobsites.map((js) => ({ id: js.id })),
              }
            : undefined,
      },
      include: {
        CostCodes: {
          select: {
            id: true,
            name: true,
          },
        },
        Jobsites: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    // Revalidate relevant paths and tags
    revalidateTag("costcodes");
    revalidateTag("assets");
    revalidatePath("/admins/assets");

    return {
      success: true,
      data: newTag,
      message: "Tag created successfully",
    };
  } catch (error) {
    console.error("Error creating tag:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
