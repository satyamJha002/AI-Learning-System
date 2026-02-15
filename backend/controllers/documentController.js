import Document from "../models/Document.js";
import Flashcard from "../models/Flascard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import mongoose from "mongoose";
import {
  isStorageConfigured,
  upload,
  getPublicUrl,
  deleteObject as deleteFromStorage,
  getObject,
} from "../config/storage.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getBaseUrl(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (req) {
    const protocol = req.get("x-forwarded-proto") || req.protocol || "http";
    const host = req.get("host");
    if (host) return `${protocol}://${host}`;
  }
  return `http://localhost:${process.env.PORT || 8000}`;
}

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a PDF file",
        statusCode: 400,
      });
    }

    const { title } = req.body;

    if (!title) {
      if (!isStorageConfigured && req.file.path)
        await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        success: false,
        error: "Please provide a document title",
        statusCode: 400,
      });
    }

    let fileUrl;
    let storageKey = null;

    if (isStorageConfigured) {
      const key = `documents/${Date.now()}-${Math.round(Math.random() * 1e9)}-${req.file.originalname}`;
      try {
        await upload(req.file.buffer, key, req.file.mimetype);
      } catch (storageErr) {
        console.error("B2 upload failed:", storageErr.message || storageErr);
        throw storageErr;
      }
      storageKey = key;
      fileUrl = getPublicUrl(key);
      if (!fileUrl) {
        fileUrl =
          getBaseUrl(req) + "/api/documents/file/" + encodeURIComponent(key);
      }
    } else {
      const baseUrl = getBaseUrl(req);
      fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;
    }

    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath: fileUrl,
      fileSize: req.file.size,
      status: "processing",
      storageKey,
    });

    const pdfInput = isStorageConfigured ? req.file.buffer : req.file.path;
    processPDF(document._id, pdfInput).catch((err) => {
      console.error("PDF processing error", err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully. Processing in progress...",
    });
  } catch (error) {
    if (req.file && !isStorageConfigured && req.file.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

/* Helper function */
const processPDF = async (documentId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);
    const chunks = chunkText(text, 500, 50);

    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "ready",
    });

    console.log(`Document: ${documentId} processed successfully`);
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);

    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.user._id) },
      },
      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcardSets",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizzes",
        },
      },
      {
        $addFields: {
          flashcardCount: { $size: "$flashcardSets" },
          quizCount: { $size: "$quizzes" },
        },
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizzes: 0,
        },
      },
      {
        $sort: { uploadData: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: true,
        error: "Document not found",
        statusCode: 404,
      });
    }

    const flashcardCount = await Flashcard.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });
    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });

    document.lastAccessed = Date.now();
    await document.save();

    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData,
    });
  } catch (error) {
    next(error);
  }
};

/** Serve file from B2 (when B2_PUBLIC_URL is not set). Key must belong to a document owned by the user. */
export const getDocumentFile = async (req, res, next) => {
  try {
    const key = decodeURIComponent(req.params.key);
    const document = await Document.findOne({
      storageKey: key,
      userId: req.user._id,
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }
    const obj = await getObject(key);
    res.set("Content-Type", obj.ContentType || "application/pdf");
    obj.Body.pipe(res);
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: true,
        error: "Document not found",
        statusCode: 404,
      });
    }

    if (document.storageKey && isStorageConfigured) {
      await deleteFromStorage(document.storageKey);
    } else if (document.filePath && !isStorageConfigured) {
      const filename = path.basename(document.filePath);
      const uploadDir = path.join(__dirname, "../uploads/documents");
      await fs.unlink(path.join(uploadDir, filename)).catch(() => {});
    }

    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/* export const updateDocument = async (req, res, next) => {
  try {
    
  } catch (error) {

    next(error)
  }
} */
