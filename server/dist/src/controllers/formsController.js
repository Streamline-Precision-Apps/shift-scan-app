import { ServiceManagerFormApprovals, ServiceFormSubmissions, ServiceTeamSubmissions, ServiceFormDraft, ServiceForm, } from "../services/formsService.js";
// Controller for forms endpoints
import express from "express";
import { ServiceCreateFormApproval, ServiceCreateFormSubmission, ServiceDeleteFormSubmission, ServiceGetForms, ServiceGetUserSubmissions, ServiceSaveDraft, ServiceSaveDraftToPending, ServiceSavePending, ServiceUpdateFormApproval, } from "../services/formsService.js";
import { ServiceGetEmployeeRequests } from "../services/formsService.js";
// Fetch employee requests for a manager (with filter, skip, take)
export const getUserSubmissions = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized User" });
        }
        const status = req.query.status;
        const skip = parseInt(req.query.skip || "0");
        const take = parseInt(req.query.take || "10");
        const startDateParam = req.query.startDate;
        const endDateParam = req.query.endDate;
        const weekFilter = req.query.week === "true";
        // Process date filters
        let startDate = null;
        let endDate = null;
        if (startDateParam)
            startDate = new Date(startDateParam);
        if (endDateParam)
            endDate = new Date(endDateParam);
        if (weekFilter) {
            const today = new Date();
            const firstDay = new Date(today);
            firstDay.setDate(today.getDate() - today.getDay());
            firstDay.setHours(0, 0, 0, 0);
            const lastDay = new Date(today);
            lastDay.setDate(today.getDate() + (6 - today.getDay()));
            lastDay.setHours(23, 59, 59, 999);
            startDate = firstDay;
            endDate = lastDay;
        }
        const submissions = await ServiceGetUserSubmissions({
            userId,
            status,
            startDate,
            endDate,
            skip,
            take,
        });
        return res.status(200).json(submissions);
    }
    catch (error) {
        console.error("Error fetching user submissions:", error);
        return res.status(500).json({ error: "Error fetching user submissions" });
    }
};
export const getEmployeeRequests = async (req, res) => {
    try {
        // userId and permission should be set by verifyToken middleware
        const userId = req.user?.id;
        const permission = req.user?.permission;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized User" });
        }
        if (permission === "USER") {
            return res.status(401).json({ error: "Unauthorized User Permission" });
        }
        const filter = req.query.filter;
        const skip = parseInt(req.query.skip || "0");
        const take = parseInt(req.query.take || "10");
        const requests = await ServiceGetEmployeeRequests({
            filter,
            skip,
            take,
            managerId: userId,
        });
        return res.status(200).json(requests);
    }
    catch (error) {
        console.error("Error fetching employee requests:", error);
        return res.status(500).json({ error: "Error fetching employee requests" });
    }
};
export const getForms = async (req, res) => {
    try {
        // Logic to get forms (this is a placeholder, replace with actual logic)
        const forms = await ServiceGetForms();
        res.status(200).json(forms);
    }
    catch (error) {
        const message = error instanceof Error && error.message
            ? error.message
            : "Failed to retrieve forms";
        res.status(400).json({ message });
    }
};
export const createFormSubmission = async (req, res) => {
    try {
        const { formTemplateId, userId } = req.body;
        const submission = await ServiceCreateFormSubmission({
            formTemplateId,
            userId,
        });
        res.status(201).json(submission);
    }
    catch (error) {
        const message = error instanceof Error && error.message
            ? error.message
            : "Failed to create form submission";
        res.status(400).json({ message });
    }
};
export const deleteFormSubmission = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await ServiceDeleteFormSubmission(id);
        res.status(200).json({ success: true });
    }
    catch (error) {
        const message = error instanceof Error && error.message
            ? error.message
            : "Failed to delete form submission";
        res.status(400).json({ message });
    }
};
export const saveDraft = async (req, res) => {
    try {
        const { formData, formTemplateId, userId, formType, submissionId, title } = req.body;
        const result = await ServiceSaveDraft({
            formData,
            formTemplateId,
            userId,
            formType,
            submissionId,
            title,
        });
        res.status(200).json(result);
    }
    catch (error) {
        const message = error instanceof Error && error.message
            ? error.message
            : "Failed to save draft";
        res.status(400).json({ message });
    }
};
export const saveDraftToPending = async (req, res) => {
    try {
        const { formData, isApprovalRequired, formTemplateId, userId, formType, submissionId, title, } = req.body;
        const result = await ServiceSaveDraftToPending({
            formData,
            isApprovalRequired,
            formTemplateId,
            userId,
            formType,
            submissionId,
            title,
        });
        res.status(200).json(result);
    }
    catch (error) {
        const message = error instanceof Error && error.message
            ? error.message
            : "Failed to save draft to pending";
        res.status(400).json({ message });
    }
};
export const savePending = async (req, res) => {
    try {
        const { formData, formTemplateId, userId, formType, submissionId, title } = req.body;
        const result = await ServiceSavePending({
            formData,
            formTemplateId,
            userId,
            formType,
            submissionId,
            title,
        });
        res.status(200).json(result);
    }
    catch (error) {
        const message = error instanceof Error && error.message
            ? error.message
            : "Failed to save pending submission";
        res.status(400).json({ message });
    }
};
export const createFormApproval = async (req, res) => {
    try {
        const { formSubmissionId, signedBy, signature, comment, approval } = req.body;
        const result = await ServiceCreateFormApproval({
            formSubmissionId,
            signedBy,
            signature,
            comment,
            approval,
        });
        res.status(201).json(result);
    }
    catch (error) {
        const message = error instanceof Error && error.message
            ? error.message
            : "Failed to create form approval";
        res.status(400).json({ message });
    }
};
export const updateFormApproval = async (req, res) => {
    try {
        const { id, formSubmissionId, comment, isApproved } = req.body;
        const result = await ServiceUpdateFormApproval({
            id,
            formSubmissionId,
            comment,
            isApproved,
        });
        res.status(200).json(result);
    }
    catch (error) {
        const message = error instanceof Error && error.message
            ? error.message
            : "Failed to update form approval";
        res.status(400).json({ message });
    }
};
// GET /api/v1/forms/formDraft/:id
export const getFormDraft = async (req, res) => {
    try {
        const user = req.user;
        const userId = typeof user?.id === "string" ? user.id : undefined;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ error: "Missing id param" });
        const draft = await ServiceFormDraft(id, userId);
        if (!draft)
            return res.status(404).json({ error: "Draft not found" });
        res.status(200).json(draft);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch form draft" });
    }
};
// GET /api/v1/forms/teamSubmission/:id
export const getTeamSubmission = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ error: "Missing id param" });
        const teamSubmission = await ServiceTeamSubmissions(id);
        if (!teamSubmission)
            return res.status(404).json({ error: "Team submission not found" });
        res.status(200).json(teamSubmission);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch team submission" });
    }
};
// GET /api/v1/forms/formSubmission/:id
export const getFormSubmission = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ error: "Missing id param" });
        const submission = await ServiceFormSubmissions(id);
        if (!submission)
            return res.status(404).json({ error: "Form submission not found" });
        res.status(200).json(submission);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch form submission" });
    }
};
// GET /api/v1/forms/managerFormApproval/:id
export const getManagerFormApproval = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ error: "Missing id param" });
        const approval = await ServiceManagerFormApprovals(id);
        if (!approval)
            return res.status(404).json({ error: "Manager form approval not found" });
        res.status(200).json(approval);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch manager form approval" });
    }
};
// GET /api/v1/forms/form/:id
export const getFormTemplate = async (req, res) => {
    try {
        const user = req.user;
        const userId = typeof user?.id === "string" ? user.id : undefined;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ error: "Missing id param" });
        const template = await ServiceForm(id, userId);
        if (!template)
            return res.status(404).json({ error: "Form template not found" });
        res.status(200).json(template);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch form template" });
    }
};
//# sourceMappingURL=formsController.js.map