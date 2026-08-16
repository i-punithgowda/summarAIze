import { Request, Response } from 'express';
import gitService from '../services/gitService';
import geminiService, { GeminiRateLimitError } from '../services/geminiService';
import * as fs from 'fs';
import * as path from 'path';

export const listDirectories = async (req: Request, res: Response) => {
    try {
        const { path: dirPath } = req.body;
        const result = await gitService.listDirectories(dirPath);
        res.json(result);
    } catch (error: any) {
        if (error.message.includes('Permission denied')) {
            res.status(403).json({ detail: error.message });
        } else if (error.message.includes('Invalid directory')) {
            res.status(400).json({ detail: error.message });
        } else {
            res.status(500).json({ detail: error.message });
        }
    }
};

export const checkRepo = async (req: Request, res: Response) => {
    try {
        const { path: repoPath } = req.body;

        if (!repoPath || !repoPath.trim()) {
            return res.status(400).json({ detail: 'Repository path is required' });
        }

        const result = await gitService.checkRepo(repoPath.trim());
        res.json(result);
    } catch (error: any) {
        if (error.message.includes('Not a git repository')) {
            res.status(404).json({ detail: error.message });
        } else if (error.message.includes('Invalid project path')) {
            res.status(400).json({ detail: error.message });
        } else {
            res.status(500).json({ detail: error.message });
        }
    }
};

export const compareBranches = async (req: Request, res: Response) => {
    try {
        const { path: repoPath, base_branch, compare_branch, review_rules } = req.body;

        if (!repoPath || !base_branch || !compare_branch) {
            return res.status(400).json({ detail: 'Missing required parameters' });
        }

        const result = await gitService.compareBranches(
            repoPath.trim(),
            base_branch.trim(),
            compare_branch.trim(),
            review_rules?.trim()
        );

        res.json(result);
    } catch (error: any) {
        if (error.message.includes('Branch not found')) {
            res.status(404).json({ detail: error.message });
        } else if (error.message.includes('Invalid project path')) {
            res.status(400).json({ detail: error.message });
        } else {
            res.status(500).json({ detail: error.message });
        }
    }
};

export const summarizePR = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ detail: 'No file uploaded' });
        }

        const file = req.file;
        const filePath = file.path;
        const fileName = file.originalname;

        // Read file content
        const content = fs.readFileSync(filePath);

        // Extract diff
        let diff = '';
        if (fileName.endsWith('.diff')) {
            diff = content.toString();
        } else if (fileName.endsWith('.zip')) {
            // For simplicity, we'll return an error for zip files
            // You can add zip extraction logic if needed
            fs.unlinkSync(filePath); // Clean up
            return res.status(400).json({ detail: 'ZIP files not yet supported in Node.js backend' });
        } else {
            fs.unlinkSync(filePath); // Clean up
            return res.status(400).json({ detail: 'Unsupported file type. Please upload .diff files' });
        }

        // Generate summary
        const { summary, suggestions } = await geminiService.generateSummary(diff);

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.json({
            summary,
            suggestions,
            diff
        });
    } catch (error: any) {
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        if (error instanceof GeminiRateLimitError) {
            return res.status(429).json({ detail: error.message });
        }
        res.status(500).json({ detail: `Error processing file: ${error.message}` });
    }
};

