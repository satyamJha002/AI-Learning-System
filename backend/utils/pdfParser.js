import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';

/**
 * Extract text from PDF (file path or buffer).
 * @param {string|Buffer} filePathOrBuffer - Path to PDF file or a Buffer (e.g. from multer memory upload)
 * @returns {Promise<{text: string, numPages: number}>}
 */
export const extractTextFromPDF = async (filePathOrBuffer) => {
  try {
    const dataBuffer =
      typeof filePathOrBuffer === 'string'
        ? await fs.readFile(filePathOrBuffer)
        : Buffer.isBuffer(filePathOrBuffer)
          ? filePathOrBuffer
          : Buffer.from(filePathOrBuffer);
    const parser = new PDFParse(new Uint8Array(dataBuffer));
    const data = await parser.getText();

    return {
      text: data.text,
      numPages: data.numPages,
      info: data.info,
    };
  } catch (error) {
    console.error('PDF parsing error: ', error);
    throw new Error('Failed to extract text from PDF');
  }
};