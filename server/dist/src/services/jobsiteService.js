// server/src/services/jobsiteService.ts
import prisma from "../lib/prisma.js";
export async function getJobsites(query) {
    if (query.qrg) {
        return prisma.jobsite.findMany({
            where: {
                status: { not: "ARCHIVED" },
            },
            select: {
                id: true,
                qrId: true,
                name: true,
                code: true,
                status: true,
            },
        });
    }
    else {
        return prisma.jobsite.findMany();
    }
}
// Find a jobsite by QR code (for QR code uniqueness check)
export async function getJobsiteByQrId(qrId) {
    const jobsite = await prisma.jobsite.findFirst({ where: { qrId } });
    console.log("Jobsite found by QR ID:", jobsite);
    return jobsite;
}
export async function getJobsiteById(id) {
    return prisma.jobsite.findUnique({ where: { id } });
}
export async function createJobsite(data) {
    // Accept both 'name' and 'temporaryJobsiteName' from the request
    const name = data.name || data.temporaryJobsiteName;
    const { code, qrId, creationComment, creationReasoning, createdById, address, city, state, zipCode, } = data;
    return prisma.$transaction(async (prisma) => {
        // Check for duplicate jobsite name
        const existingJobsites = await prisma.jobsite.findMany({ where: { name } });
        if (existingJobsites.length > 0) {
            throw new Error("A jobsite with the same name already exists.");
        }
        const existingCode = await prisma.jobsite.findMany({ where: { code } });
        if (existingCode.length > 0) {
            throw new Error("Jobsite code must be empty upon creation.");
        }
        const jobsiteData = {
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
                connect: { id: "All" },
            },
            createdBy: createdById ? { connect: { id: createdById } } : undefined,
        };
        if (address && city && state && zipCode) {
            // Try to find address first
            let addr = await prisma.address.findFirst({
                where: { street: address, city, state, zipCode },
            });
            if (!addr) {
                addr = await prisma.address.create({
                    data: { street: address, city, state, zipCode },
                });
            }
            if (addr) {
                jobsiteData.Address = { connect: { id: addr.id } };
            }
        }
        // Create the jobsite and get the created record
        const jobsite = await prisma.jobsite.create({
            data: jobsiteData,
            include: {
                createdBy: {
                    select: { firstName: true, lastName: true },
                },
            },
        });
        return jobsite;
    });
}
export async function updateJobsite(id, updates) {
    return prisma.jobsite.update({
        where: { id },
        data: updates,
    });
}
export async function deleteJobsite(id) {
    try {
        await prisma.jobsite.delete({ where: { id } });
        return true;
    }
    catch (e) {
        return false;
    }
}
//# sourceMappingURL=jobsiteService.js.map