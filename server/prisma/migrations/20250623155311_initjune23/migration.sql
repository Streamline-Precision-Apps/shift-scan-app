-- CreateEnum
CREATE TYPE "CreatedVia" AS ENUM ('ADMIN', 'MOBILE');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('USER', 'MANAGER', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "EquipmentTags" AS ENUM ('TRUCK', 'TRAILER', 'VEHICLE', 'EQUIPMENT');

-- CreateEnum
CREATE TYPE "IsActive" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('MECHANIC', 'TRUCK_DRIVER', 'LABOR', 'TASCO');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('PENDING', 'LOW', 'MEDIUM', 'HIGH', 'TODAY');

-- CreateEnum
CREATE TYPE "LoadType" AS ENUM ('UNSCREENED', 'SCREENED');

-- CreateEnum
CREATE TYPE "EquipmentState" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'NEEDS_REPAIR', 'RETIRED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('IN_PROGRESS', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ReportVisibility" AS ENUM ('PRIVATE', 'MANAGEMENT', 'COMPANY');

-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'DENIED');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'FILE', 'DROPDOWN', 'CHECKBOX');

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "creationReason" TEXT,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "contactPerson" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "hasProject" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdVia" "CreatedVia" NOT NULL DEFAULT 'ADMIN',
    "jobsiteId" TEXT,
    "addressId" TEXT,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addressId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "SubscriptionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostCode" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CCTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "CCTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crew" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "crewType" "WorkType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crew_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdfDocument" (
    "id" TEXT NOT NULL,
    "qrId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "description" TEXT,
    "fileData" BYTEA NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'application/pdf',
    "size" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PdfDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTag" (
    "id" TEXT NOT NULL,
    "tagName" TEXT NOT NULL,

    CONSTRAINT "DocumentTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "qrId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "creationReason" TEXT,
    "equipmentTag" "EquipmentTags" NOT NULL DEFAULT 'EQUIPMENT',
    "state" "EquipmentState" NOT NULL DEFAULT 'AVAILABLE',
    "isDisabledByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "overWeight" BOOLEAN DEFAULT false,
    "currentWeight" DOUBLE PRECISION DEFAULT 0,
    "createdById" TEXT,
    "createdVia" "CreatedVia" NOT NULL DEFAULT 'MOBILE',

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentVehicleInfo" (
    "id" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "year" TEXT,
    "licensePlate" TEXT,
    "registrationExpiration" TIMESTAMP(3),
    "mileage" INTEGER,

    CONSTRAINT "EquipmentVehicleInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeEquipmentLog" (
    "id" TEXT NOT NULL,
    "timeSheetId" TEXT NOT NULL,
    "equipmentId" TEXT,
    "maintenanceId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "comment" TEXT,

    CONSTRAINT "EmployeeEquipmentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Error" (
    "id" TEXT NOT NULL,
    "errorMessage" TEXT,
    "userId" TEXT,
    "fileLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Error_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormTemplate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "formType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isSignatureRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FormTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormGrouping" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "FormGrouping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormField" (
    "id" TEXT NOT NULL,
    "formGroupingId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FieldType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "defaultValue" TEXT,
    "placeholder" TEXT,
    "maxLength" INTEGER,
    "helperText" TEXT,

    CONSTRAINT "FormField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormFieldOption" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "FormFieldOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "formTemplateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "formType" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "status" "FormStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormApproval" (
    "id" TEXT NOT NULL,
    "formSubmissionId" TEXT NOT NULL,
    "signedBy" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "signature" TEXT,
    "comment" TEXT,

    CONSTRAINT "FormApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jobsite" (
    "id" TEXT NOT NULL,
    "qrId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "creationReason" TEXT,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "addressId" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archiveDate" TIMESTAMP(3),
    "clientId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdVia" "CreatedVia" NOT NULL DEFAULT 'ADMIN',

    CONSTRAINT "Jobsite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parameters" JSONB,
    "visibility" "ReportVisibility" NOT NULL DEFAULT 'PRIVATE',
    "tags" TEXT[],

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportRun" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ReportStatus" NOT NULL,
    "results" JSONB,
    "duration" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "customParams" JSONB,
    "exportFormats" TEXT[],
    "lastExportedAt" TIMESTAMP(3),

    CONSTRAINT "ReportRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSheet" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "jobsiteId" TEXT NOT NULL,
    "costcode" TEXT NOT NULL,
    "nu" TEXT NOT NULL DEFAULT 'nu',
    "Fp" TEXT NOT NULL DEFAULT 'fp',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "comment" TEXT,
    "statusComment" TEXT,
    "location" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "workType" "WorkType" NOT NULL,
    "editedByUserId" TEXT,
    "newTimeSheetId" TEXT,
    "createdByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceLog" (
    "id" TEXT NOT NULL,
    "timeSheetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "maintenanceId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "comment" TEXT,

    CONSTRAINT "MaintenanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "equipmentIssue" TEXT,
    "employeeEquipmentLogId" TEXT,
    "additionalInfo" TEXT,
    "location" TEXT,
    "problemDiagnosis" TEXT,
    "solution" TEXT,
    "totalHoursLaboured" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priority" "Priority" NOT NULL,
    "delay" TIMESTAMP(3),
    "delayReasoning" TEXT,
    "repaired" BOOLEAN NOT NULL DEFAULT false,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "hasBeenDelayed" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TascoLog" (
    "id" TEXT NOT NULL,
    "timeSheetId" TEXT NOT NULL,
    "shiftType" TEXT NOT NULL,
    "equipmentId" TEXT,
    "laborType" TEXT,
    "materialType" TEXT,
    "LoadQuantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TascoLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TascoMaterialTypes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TascoMaterialTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TruckingLog" (
    "id" TEXT NOT NULL,
    "timeSheetId" TEXT NOT NULL,
    "laborType" TEXT NOT NULL,
    "taskName" TEXT,
    "equipmentId" TEXT,
    "startingMileage" INTEGER,
    "endingMileage" INTEGER,
    "truckLaborLogId" TEXT,

    CONSTRAINT "TruckingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TruckLaborLogs" (
    "id" TEXT NOT NULL,
    "truckingLogId" TEXT,
    "type" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),

    CONSTRAINT "TruckLaborLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StateMileage" (
    "id" TEXT NOT NULL,
    "truckingLogId" TEXT NOT NULL,
    "state" TEXT,
    "stateLineMileage" INTEGER,

    CONSTRAINT "StateMileage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "truckingLogId" TEXT NOT NULL,
    "LocationOfMaterial" TEXT,
    "name" TEXT,
    "quantity" INTEGER,
    "materialWeight" DOUBLE PRECISION,
    "lightWeight" DOUBLE PRECISION,
    "grossWeight" DOUBLE PRECISION,
    "loadType" "LoadType",
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefuelLog" (
    "id" TEXT NOT NULL,
    "employeeEquipmentLogId" TEXT,
    "truckingLogId" TEXT,
    "tascoLogId" TEXT,
    "gallonsRefueled" DOUBLE PRECISION,
    "milesAtFueling" INTEGER,

    CONSTRAINT "RefuelLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentHauled" (
    "id" TEXT NOT NULL,
    "truckingLogId" TEXT NOT NULL,
    "equipmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobSiteId" TEXT,

    CONSTRAINT "EquipmentHauled_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "signature" TEXT,
    "DOB" TIMESTAMP(3) NOT NULL,
    "truckView" BOOLEAN NOT NULL,
    "tascoView" BOOLEAN NOT NULL,
    "laborView" BOOLEAN NOT NULL,
    "mechanicView" BOOLEAN NOT NULL,
    "permission" "Permission" NOT NULL DEFAULT 'USER',
    "image" TEXT,
    "startDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "terminationDate" TIMESTAMP(3),
    "accountSetup" BOOLEAN NOT NULL DEFAULT false,
    "clockedIn" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,
    "passwordResetTokenId" TEXT,
    "workTypeId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "generalReminders" BOOLEAN NOT NULL DEFAULT false,
    "personalReminders" BOOLEAN NOT NULL DEFAULT false,
    "cameraAccess" BOOLEAN NOT NULL DEFAULT false,
    "locationAccess" BOOLEAN NOT NULL DEFAULT false,
    "cookiesAccess" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contacts" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "emergencyContact" TEXT,
    "emergencyContactNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiration" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CCTagToCostCode" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CCTagToCostCode_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CCTagToJobsite" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CCTagToJobsite_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CrewToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CrewToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DocumentTagToEquipment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DocumentTagToEquipment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DocumentTagToPdfDocument" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DocumentTagToPdfDocument_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FormGroupingToFormTemplate" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FormGroupingToFormTemplate_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_name_key" ON "Client"("name");

-- CreateIndex
CREATE INDEX "Client_companyId_name_idx" ON "Client"("companyId", "name");

-- CreateIndex
CREATE INDEX "Client_hasProject_idx" ON "Client"("hasProject");

-- CreateIndex
CREATE UNIQUE INDEX "CostCode_name_key" ON "CostCode"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CCTag_name_key" ON "CCTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PdfDocument_qrId_key" ON "PdfDocument"("qrId");

-- CreateIndex
CREATE INDEX "PdfDocument_qrId_idx" ON "PdfDocument"("qrId");

-- CreateIndex
CREATE INDEX "PdfDocument_fileName_idx" ON "PdfDocument"("fileName");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_qrId_key" ON "Equipment"("qrId");

-- CreateIndex
CREATE INDEX "Equipment_qrId_idx" ON "Equipment"("qrId");

-- CreateIndex
CREATE INDEX "Equipment_state_isDisabledByAdmin_idx" ON "Equipment"("state", "isDisabledByAdmin");

-- CreateIndex
CREATE INDEX "Equipment_approvalStatus_idx" ON "Equipment"("approvalStatus");

-- CreateIndex
CREATE INDEX "EmployeeEquipmentLog_timeSheetId_equipmentId_maintenanceId_idx" ON "EmployeeEquipmentLog"("timeSheetId", "equipmentId", "maintenanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Jobsite_qrId_key" ON "Jobsite"("qrId");

-- CreateIndex
CREATE INDEX "Jobsite_qrId_idx" ON "Jobsite"("qrId");

-- CreateIndex
CREATE INDEX "Jobsite_clientId_idx" ON "Jobsite"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_name_key" ON "Report"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Maintenance_employeeEquipmentLogId_key" ON "Maintenance"("employeeEquipmentLogId");

-- CreateIndex
CREATE UNIQUE INDEX "TascoMaterialTypes_name_key" ON "TascoMaterialTypes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RefuelLog_employeeEquipmentLogId_key" ON "RefuelLog"("employeeEquipmentLogId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_firstName_lastName_DOB_key" ON "User"("firstName", "lastName", "DOB");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Contacts_employeeId_key" ON "Contacts"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_email_token_key" ON "PasswordResetToken"("email", "token");

-- CreateIndex
CREATE INDEX "_CCTagToCostCode_B_index" ON "_CCTagToCostCode"("B");

-- CreateIndex
CREATE INDEX "_CCTagToJobsite_B_index" ON "_CCTagToJobsite"("B");

-- CreateIndex
CREATE INDEX "_CrewToUser_B_index" ON "_CrewToUser"("B");

-- CreateIndex
CREATE INDEX "_DocumentTagToEquipment_B_index" ON "_DocumentTagToEquipment"("B");

-- CreateIndex
CREATE INDEX "_DocumentTagToPdfDocument_B_index" ON "_DocumentTagToPdfDocument"("B");

-- CreateIndex
CREATE INDEX "_FormGroupingToFormTemplate_B_index" ON "_FormGroupingToFormTemplate"("B");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentVehicleInfo" ADD CONSTRAINT "EquipmentVehicleInfo_id_fkey" FOREIGN KEY ("id") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeEquipmentLog" ADD CONSTRAINT "EmployeeEquipmentLog_timeSheetId_fkey" FOREIGN KEY ("timeSheetId") REFERENCES "TimeSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeEquipmentLog" ADD CONSTRAINT "EmployeeEquipmentLog_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeEquipmentLog" ADD CONSTRAINT "EmployeeEquipmentLog_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "Maintenance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormTemplate" ADD CONSTRAINT "FormTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormField" ADD CONSTRAINT "FormField_formGroupingId_fkey" FOREIGN KEY ("formGroupingId") REFERENCES "FormGrouping"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormFieldOption" ADD CONSTRAINT "FormFieldOption_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "FormField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formTemplateId_fkey" FOREIGN KEY ("formTemplateId") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormApproval" ADD CONSTRAINT "FormApproval_formSubmissionId_fkey" FOREIGN KEY ("formSubmissionId") REFERENCES "FormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormApproval" ADD CONSTRAINT "FormApproval_signedBy_fkey" FOREIGN KEY ("signedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jobsite" ADD CONSTRAINT "Jobsite_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jobsite" ADD CONSTRAINT "Jobsite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jobsite" ADD CONSTRAINT "Jobsite_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportRun" ADD CONSTRAINT "ReportRun_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSheet" ADD CONSTRAINT "TimeSheet_costcode_fkey" FOREIGN KEY ("costcode") REFERENCES "CostCode"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSheet" ADD CONSTRAINT "TimeSheet_jobsiteId_fkey" FOREIGN KEY ("jobsiteId") REFERENCES "Jobsite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSheet" ADD CONSTRAINT "TimeSheet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "Maintenance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_timeSheetId_fkey" FOREIGN KEY ("timeSheetId") REFERENCES "TimeSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TascoLog" ADD CONSTRAINT "TascoLog_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TascoLog" ADD CONSTRAINT "TascoLog_materialType_fkey" FOREIGN KEY ("materialType") REFERENCES "TascoMaterialTypes"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TascoLog" ADD CONSTRAINT "TascoLog_timeSheetId_fkey" FOREIGN KEY ("timeSheetId") REFERENCES "TimeSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TruckingLog" ADD CONSTRAINT "TruckingLog_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TruckingLog" ADD CONSTRAINT "TruckingLog_timeSheetId_fkey" FOREIGN KEY ("timeSheetId") REFERENCES "TimeSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TruckLaborLogs" ADD CONSTRAINT "TruckLaborLogs_truckingLogId_fkey" FOREIGN KEY ("truckingLogId") REFERENCES "TruckingLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StateMileage" ADD CONSTRAINT "StateMileage_truckingLogId_fkey" FOREIGN KEY ("truckingLogId") REFERENCES "TruckingLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_truckingLogId_fkey" FOREIGN KEY ("truckingLogId") REFERENCES "TruckingLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefuelLog" ADD CONSTRAINT "RefuelLog_employeeEquipmentLogId_fkey" FOREIGN KEY ("employeeEquipmentLogId") REFERENCES "EmployeeEquipmentLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefuelLog" ADD CONSTRAINT "RefuelLog_tascoLogId_fkey" FOREIGN KEY ("tascoLogId") REFERENCES "TascoLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefuelLog" ADD CONSTRAINT "RefuelLog_truckingLogId_fkey" FOREIGN KEY ("truckingLogId") REFERENCES "TruckingLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentHauled" ADD CONSTRAINT "EquipmentHauled_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentHauled" ADD CONSTRAINT "EquipmentHauled_jobSiteId_fkey" FOREIGN KEY ("jobSiteId") REFERENCES "Jobsite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentHauled" ADD CONSTRAINT "EquipmentHauled_truckingLogId_fkey" FOREIGN KEY ("truckingLogId") REFERENCES "TruckingLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CCTagToCostCode" ADD CONSTRAINT "_CCTagToCostCode_A_fkey" FOREIGN KEY ("A") REFERENCES "CCTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CCTagToCostCode" ADD CONSTRAINT "_CCTagToCostCode_B_fkey" FOREIGN KEY ("B") REFERENCES "CostCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CCTagToJobsite" ADD CONSTRAINT "_CCTagToJobsite_A_fkey" FOREIGN KEY ("A") REFERENCES "CCTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CCTagToJobsite" ADD CONSTRAINT "_CCTagToJobsite_B_fkey" FOREIGN KEY ("B") REFERENCES "Jobsite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrewToUser" ADD CONSTRAINT "_CrewToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Crew"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrewToUser" ADD CONSTRAINT "_CrewToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentTagToEquipment" ADD CONSTRAINT "_DocumentTagToEquipment_A_fkey" FOREIGN KEY ("A") REFERENCES "DocumentTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentTagToEquipment" ADD CONSTRAINT "_DocumentTagToEquipment_B_fkey" FOREIGN KEY ("B") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentTagToPdfDocument" ADD CONSTRAINT "_DocumentTagToPdfDocument_A_fkey" FOREIGN KEY ("A") REFERENCES "DocumentTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentTagToPdfDocument" ADD CONSTRAINT "_DocumentTagToPdfDocument_B_fkey" FOREIGN KEY ("B") REFERENCES "PdfDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormGroupingToFormTemplate" ADD CONSTRAINT "_FormGroupingToFormTemplate_A_fkey" FOREIGN KEY ("A") REFERENCES "FormGrouping"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormGroupingToFormTemplate" ADD CONSTRAINT "_FormGroupingToFormTemplate_B_fkey" FOREIGN KEY ("B") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
