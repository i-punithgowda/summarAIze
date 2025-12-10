import { Router } from 'express';
import multer from 'multer';
import * as gitController from '../controllers/gitController';

const router = Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Routes
router.post('/list-directories', gitController.listDirectories);
router.post('/check-repo', gitController.checkRepo);
router.post('/compare-branches', gitController.compareBranches);
router.post('/summarize-pr', upload.single('file'), gitController.summarizePR);

export default router;

