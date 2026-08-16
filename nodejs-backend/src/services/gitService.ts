import simpleGit, { SimpleGit } from 'simple-git';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Directory, ListDirectoriesResponse, CheckRepoResponse, FileChange } from '../types';
import geminiService, { GeminiRateLimitError } from './geminiService';
import { getSkipReason, skipMessage } from '../utils/reviewableFiles';

class GitService {
    async listDirectories(dirPath?: string): Promise<ListDirectoriesResponse> {
        // Start from home directory if no path provided
        const currentPath = dirPath || os.homedir();

        if (!fs.existsSync(currentPath) || !fs.statSync(currentPath).isDirectory()) {
            throw new Error('Invalid directory path');
        }

        try {
            // Get parent directory
            const parentPath = currentPath !== '/' ? path.dirname(currentPath) : null;

            // List all directories in the current path
            const entries = fs.readdirSync(currentPath);
            const directories: Directory[] = [];

            for (const entry of entries.sort()) {
                const fullPath = path.join(currentPath, entry);
                try {
                    const stat = fs.statSync(fullPath);
                    if (stat.isDirectory() && !entry.startsWith('.')) {
                        // Check if it's a git repo
                        const isGitRepo = fs.existsSync(path.join(fullPath, '.git'));
                        directories.push({
                            name: entry,
                            path: fullPath,
                            is_git_repo: isGitRepo
                        });
                    }
                } catch (err) {
                    // Skip entries we can't access
                    continue;
                }
            }

            return {
                current_path: currentPath,
                parent_path: parentPath,
                directories
            };
        } catch (error: any) {
            if (error.code === 'EACCES') {
                throw new Error('Permission denied');
            }
            throw new Error(`Error listing directories: ${error.message}`);
        }
    }

    async checkRepo(repoPath: string): Promise<CheckRepoResponse> {
        if (!fs.existsSync(repoPath) || !fs.statSync(repoPath).isDirectory()) {
            throw new Error('Invalid project path');
        }

        const gitDir = path.join(repoPath, '.git');
        if (!fs.existsSync(gitDir)) {
            throw new Error('Not a git repository');
        }

        const projectName = path.basename(repoPath);

        try {
            const git: SimpleGit = simpleGit(repoPath);

            // Get all local branches
            const branchSummary = await git.branchLocal();
            const localBranches = branchSummary.all;

            // Get all remote branches
            let remoteBranches: string[] = [];
            try {
                const remotes = await git.getRemotes(false);
                if (remotes.length > 0) {
                    const branchesOutput = await git.branch(['-r']);
                    remoteBranches = branchesOutput.all;
                }
            } catch (err) {
                // No remotes or error getting remote branches
            }

            // Combine and deduplicate
            const allBranches = Array.from(new Set([...localBranches, ...remoteBranches]));

            // Format branch names
            const formatBranch = (branch: string): string => {
                if (branch === 'main' || branch === 'master') {
                    return branch;
                }
                const parts = branch.split('/');
                if (parts.length >= 2) {
                    return parts.slice(-2).join('/');
                }
                return branch;
            };

            const formattedBranches = Array.from(
                new Set(allBranches.map(formatBranch))
            ).sort();

            console.log('Local branches:', localBranches);
            console.log('Remote branches:', remoteBranches);
            console.log('Formatted branches:', formattedBranches);

            return {
                project_name: projectName,
                branches: formattedBranches
            };
        } catch (error: any) {
            throw new Error(`Error reading branches: ${error.message}`);
        }
    }

    async compareBranches(
        repoPath: string,
        baseBranch: string,
        compareBranch: string,
        reviewRules?: string
    ): Promise<{ files: FileChange[] }> {
        if (!fs.existsSync(repoPath) || !fs.statSync(repoPath).isDirectory()) {
            throw new Error('Invalid project path');
        }

        try {
            const git: SimpleGit = simpleGit(repoPath);

            // Find full ref names for the branches
            const findFullRef = async (branch: string): Promise<string | null> => {
                const branchSummary = await git.branchLocal();

                // Try local first
                for (const head of branchSummary.all) {
                    if (branch === 'main' && head === 'main') return head;
                    if (branch === 'master' && head === 'master') return head;
                    const parts = head.split('/');
                    if (parts.slice(-2).join('/') === branch) return head;
                }

                // Try remotes
                try {
                    const remoteBranches = await git.branch(['-r']);
                    for (const ref of remoteBranches.all) {
                        const parts = ref.split('/');
                        if (parts.slice(-2).join('/') === branch) return ref;
                    }
                } catch (err) {
                    // No remotes
                }

                return null;
            };

            const baseRef = await findFullRef(baseBranch);
            const compareRef = await findFullRef(compareBranch);

            if (!baseRef || !compareRef) {
                throw new Error('Branch not found');
            }

            // Get the diff between the two branches (name-status to get changed files)
            const diffSummary = await git.diffSummary([`${baseRef}...${compareRef}`]);
            const changedFiles: FileChange[] = [];

            console.log(`\n📊 Branch Comparison Stats:`);
            console.log(`   Total files changed: ${diffSummary.files.length}`);
            console.log(`   Files: ${diffSummary.files.map(f => f.file).join(', ')}\n`);

            let apiCallCount = 0;
            let skippedCount = 0;
            let rateLimited = false;

            for (const file of diffSummary.files) {
                const filePath = file.file;
                const isBinary = Boolean((file as { binary?: boolean }).binary);
                const preSkip = getSkipReason(filePath, isBinary, 'has-diff');

                let oldContent = '';
                let newContent = '';

                if (preSkip === 'binary' || preSkip === 'image-or-asset') {
                    skippedCount++;
                    console.log(`⏭️  Skipping AI for ${filePath} (${preSkip})`);
                    changedFiles.push({
                        file: filePath,
                        old_content: '[Binary or asset file]',
                        new_content: '[Binary or asset file]',
                        summary: skipMessage(preSkip, filePath),
                        suggestions: []
                    });
                    continue;
                }

                try {
                    try {
                        oldContent = await git.show([`${baseRef}:${filePath}`]);
                    } catch (err) {
                        oldContent = '';
                    }

                    try {
                        newContent = await git.show([`${compareRef}:${filePath}`]);
                    } catch (err) {
                        newContent = '';
                    }
                } catch (err) {
                    console.error(`Error getting content for ${filePath}:`, err);
                }

                if (preSkip) {
                    skippedCount++;
                    console.log(`⏭️  Skipping AI for ${filePath} (${preSkip})`);
                    changedFiles.push({
                        file: filePath,
                        old_content: oldContent,
                        new_content: newContent,
                        summary: skipMessage(preSkip, filePath),
                        suggestions: []
                    });
                    continue;
                }

                const diffText = await git.diff([`${baseRef}...${compareRef}`, '--', filePath]);
                const skipReason = getSkipReason(filePath, false, diffText);
                if (skipReason) {
                    skippedCount++;
                    console.log(`⏭️  Skipping AI for ${filePath} (${skipReason})`);
                    changedFiles.push({
                        file: filePath,
                        old_content: oldContent,
                        new_content: newContent,
                        summary: skipMessage(skipReason, filePath),
                        suggestions: []
                    });
                    continue;
                }

                if (rateLimited) {
                    skippedCount++;
                    console.log(`⏭️  Skipping AI for ${filePath} (rate limit)`);
                    changedFiles.push({
                        file: filePath,
                        old_content: oldContent,
                        new_content: newContent,
                        summary: 'Skipped AI review — Gemini rate limit was hit earlier in this comparison.',
                        suggestions: []
                    });
                    continue;
                }

                apiCallCount++;
                console.log(`🤖 API Call #${apiCallCount} - Processing: ${filePath} (${diffText.length} chars)`);

                try {
                    const { summary, suggestions } = await geminiService.generateSummary(diffText, reviewRules);
                    console.log(`   ✅ Completed for ${filePath}`);
                    changedFiles.push({
                        file: filePath,
                        old_content: oldContent,
                        new_content: newContent,
                        summary,
                        suggestions
                    });
                } catch (err) {
                    if (err instanceof GeminiRateLimitError) {
                        rateLimited = true;
                        console.warn(`   🛑 Stopping further Gemini calls: ${err.message}`);
                        changedFiles.push({
                            file: filePath,
                            old_content: oldContent,
                            new_content: newContent,
                            summary: err.message,
                            suggestions: []
                        });
                        continue;
                    }
                    throw err;
                }
            }

            console.log(`\n✨ Branch comparison complete!`);
            console.log(`   Total API calls made: ${apiCallCount}`);
            console.log(`   Files skipped (assets/binaries/rate limit): ${skippedCount}`);
            console.log(`   Files processed: ${changedFiles.length}\n`);

            return { files: changedFiles };
        } catch (error: any) {
            throw new Error(`Error comparing branches: ${error.message}`);
        }
    }
}

export default new GitService();

