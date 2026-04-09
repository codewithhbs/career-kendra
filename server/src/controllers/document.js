"use strict";

const { Job, Company, JobInterview, User, JobApplication, Message, JobApplicationDocument } = require("../models");
const { Op, Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { sendSuccess, sendError } = require("../utils/api");
const { sendMessage } = require("../utils/sendMessage");



exports.uploadApplicationDocuments = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { applicationId } = req.params;
        const files = req.files;

        if (!files || files.length === 0) {
            return sendError(res, 400, "No files uploaded");
        }

        // Find application
        const application = await JobApplication.findByPk(applicationId, {
            include: [
                {
                    model: User,
                    as: "candidate",
                    attributes: ["id", "userName", "emailAddress"],
                },
                {
                    model: Job,
                    as: "job",
                    attributes: ["id", "jobTitle", "employerId"],
                    include: [
                        {
                            model: Company,
                            as: "company",
                            attributes: ["companyName", "companyEmail", "companyPhone"],
                        },
                    ],
                },
            ],
        });

        if (!application) {
            return sendError(res, 404, "Job application not found");
        }

        // Ensure candidate owns this application
        if (application.userId !== userId) {
            return sendError(
                res,
                403,
                "Unauthorized to upload documents for this application"
            );
        }

        // Format uploaded files


        const documents = files.map((file) => ({
            type: file.fieldname,
            fileName: file.originalname,
            filePath: `/uploads/documents/${file.filename}`,
            status: "pending",
            rejectionReason: null,
            verifiedBy: null,
            verifiedAt: null,
        }));

        // Check if document record already exists
        const existing = await JobApplicationDocument.findOne({
            where: { applicationId },
        });

        let savedDocuments;

        if (existing) {
            let existingDocs = existing.documents;

            // Ensure JSON array
            if (typeof existingDocs === "string") {
                existingDocs = JSON.parse(existingDocs);
            }

            // Replace documents of same type instead of duplicating
            documents.forEach((doc) => {
                const index = existingDocs.findIndex((d) => d.type === doc.type);

                if (index !== -1) {
                    existingDocs[index] = doc;
                } else {
                    existingDocs.push(doc);
                }
            });

            existing.documents = existingDocs;
            await existing.save();

            savedDocuments = existing;
        } else {
            savedDocuments = await JobApplicationDocument.create({
                applicationId,
                documents,
                uploadedBy: userId,
            });
        }

        // Mark application document uploaded
        application.documentUploaded = true;
        await application.save();

        // Notify candidate
        await sendMessage({
            applicationId,
            senderId: 0,
            senderType: "system",
            receiverId: userId,
            receiverType: "user",
            content:
                "Your documents have been uploaded successfully and are pending verification.",
        });

        // Notify employer
        if (application.job?.employerId) {
            await sendMessage({
                applicationId,
                senderId: 0,
                senderType: "system",
                receiverId: application.employerDecisionById,
                receiverType: "employer",
                content: `New documents uploaded for ${application.job.jobTitle}. Please review and verify.`,
            });
        }

        return sendSuccess(
            res,
            savedDocuments,
            "Documents uploaded successfully"
        );
    } catch (error) {
        console.error("Upload Documents Error:", error);
        return sendError(res, 500, "Failed to upload documents");
    }
};

exports.getUploadedDocuments = async (req, res) => {
    try {

        const { applicationId } = req.params;

        const docs = await JobApplicationDocument.findOne({
            where: { applicationId },
            include: [
                {
                    model: User,
                    as: "uploader",
                    attributes: ["id", "userName", "emailAddress"]
                }
            ]
        });

        if (!docs) {
            return sendError(res, 404, "No documents found");
        }

        return sendSuccess(res, docs, "Documents fetched successfully");

    } catch (error) {
        console.error("Fetch Documents Error:", error);
        return sendError(res, 500, "Failed to fetch documents");
    }
};


exports.verifyApplicationDocument = async (req, res) => {
    try {

        const adminId = req.user?.id;
        const { id } = req.params;
        const { type, status, rejectionReason } = req.body;
        console.log("Verify Document Payload:", { id, type, status, rejectionReason });
        const record = await JobApplicationDocument.findByPk(id);

        if (!record) {
            return sendError(res, 404, "Document record not found");
        }

        const documents = record.documents;

        const updatedDocs = documents.map((doc) => {
            if (doc.type === type) {
                return {
                    ...doc,
                    status,
                    rejectionReason: status === "rejected" ? rejectionReason : null,
                    verifiedBy: adminId,
                    verifiedAt: new Date()
                };
            }
            return doc;
        });

        record.documents = updatedDocs;
        await record.save();

        return sendSuccess(res, record, "Document status updated");

    } catch (error) {
        console.error("Verify Document Error:", error);
        return sendError(res, 500, "Failed to update document");
    }
};


exports.deleteDocument = async (req, res) => {
    try {

        const { id } = req.params;
        const { type } = req.body;

        const record = await JobApplicationDocument.findByPk(id);

        if (!record) {
            return sendError(res, 404, "Document not found");
        }

        const updatedDocs = record.documents.filter(
            (doc) => doc.type !== type
        );

        record.documents = updatedDocs;

        await record.save();

        return sendSuccess(res, record, "Document deleted successfully");

    } catch (error) {
        console.error("Delete Document Error:", error);
        return sendError(res, 500, "Failed to delete document");
    }
};

exports.reuploadDocument = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const file = req.files[0];
       
        if (!file) {
            return sendError(res, 400, "File required");
        }

        // Find document record
        const record = await JobApplicationDocument.findByPk(id);

        if (!record) {
            return sendError(res, 404, "Document record not found");
        }

        const applicationId = record.applicationId;

        // Find application
        const application = await JobApplication.findByPk(applicationId, {
            include: [
                {
                    model: User,
                    as: "candidate",
                    attributes: ["id", "userName", "emailAddress"],
                },
                {
                    model: Job,
                    as: "job",
                    attributes: ["id", "jobTitle", "employerId"],
                    include: [
                        {
                            model: Company,
                            as: "company",
                            attributes: ["companyName", "companyEmail", "companyPhone"],
                        },
                    ],
                },
            ],
        });

        if (!application) {
            return sendError(res, 404, "Application not found");
        }

        // Ensure candidate owns this application
        if (application.userId !== userId) {
            return sendError(res, 403, "Unauthorized");
        }

        // Update document
        const updatedDocs = record.documents.map((doc) => {
            if (doc.type === file.fieldname) {
                return {
                    ...doc,
                    fileName: file.originalname,
                    filePath: `/uploads/documents/${file.filename}`,
                    status: "pending",
                    rejectionReason: null,
                    verifiedBy: null,
                    verifiedAt: null,
                };
            }
            return doc;
        });

        record.documents = updatedDocs;
        await record.save();

        // Notify candidate
        await sendMessage({
            applicationId,
            senderId: 0,
            senderType: "system",
            receiverId: application.userId,
            receiverType: "user",
            content:
                "Your document has been reuploaded successfully and is pending verification.",
        });

        // Notify employer
        if (application.job?.employerId) {
            await sendMessage({
                applicationId,
                senderId: 0,
                senderType: "system",
                receiverId: application.employerDecisionById,
                receiverType: "employer",
                content: `Documents have been reuploaded for ${application.job.jobTitle}. Please review and verify.`,
            });
        }

        return sendSuccess(res, record, "Document reuploaded successfully");

    } catch (error) {
        console.error("Reupload Error:", error);
        return sendError(res, 500, "Failed to reupload document");
    }
};