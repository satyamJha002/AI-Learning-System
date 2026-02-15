import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocument,
  getDocumentFile,
  deleteDocument,
} from '../controllers/documentController.js';
import protect from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/file/:key', getDocumentFile);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);
/* router.put("/:id", updateDocument)
 */
export default router