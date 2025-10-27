// Controller for forms endpoints

!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b1ab0451-6da4-5adc-b0e6-9e0e20d3a43a")}catch(e){}}();
import express from "express";
import { ServiceCreateFormApproval, ServiceCreateFormSubmission, ServiceDeleteFormSubmission, ServiceSaveDraft, ServiceSaveDraftToPending, ServiceSavePending, ServiceUpdateFormApproval, } from "../services/formsService.js";
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
//# sourceMappingURL=formsController.js.map
//# debugId=b1ab0451-6da4-5adc-b0e6-9e0e20d3a43a
