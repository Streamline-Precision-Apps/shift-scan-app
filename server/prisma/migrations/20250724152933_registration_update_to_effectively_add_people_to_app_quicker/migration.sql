/*
  Warnings:

  - A unique constraint covering the columns `[firstName,lastName,username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_firstName_lastName_DOB_key";

-- AlterTable
ALTER TABLE "Contacts" ALTER COLUMN "phoneNumber" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_firstName_lastName_username_key" ON "User"("firstName", "lastName", "username");
