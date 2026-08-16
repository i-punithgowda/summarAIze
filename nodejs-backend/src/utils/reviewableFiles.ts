import * as path from 'path';

const SKIP_EXTENSIONS = new Set([
    // images
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.ico', '.tif', '.tiff',
    '.avif', '.heic', '.heif', '.svg', '.svgz', '.psd', '.ai', '.eps',
    // fonts
    '.woff', '.woff2', '.ttf', '.otf', '.eot',
    // media
    '.mp3', '.mp4', '.mov', '.avi', '.mkv', '.webm', '.wav', '.ogg', '.flac', '.m4a', '.m4v',
    // documents / archives / binaries
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.zip', '.gz', '.tar', '.tgz', '.7z', '.rar', '.bz2',
    '.exe', '.dll', '.so', '.dylib', '.bin', '.dat', '.class', '.pyc', '.pyo', '.o', '.a',
    '.wasm',
    // generated
    '.map',
    // model / data dumps
    '.parquet', '.pkl', '.h5', '.pt', '.onnx', '.npy',
]);

const SKIP_FILENAMES = new Set([
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'bun.lock',
    'bun.lockb',
    'composer.lock',
    'cargo.lock',
    'poetry.lock',
    'gemfile.lock',
    'go.sum',
    'pipfile.lock',
]);

const SKIP_DIR_SEGMENTS = new Set([
    'node_modules',
    '.git',
    '__pycache__',
    'coverage',
    '.next',
    'vendor',
]);

export type SkipReason =
    | 'binary'
    | 'image-or-asset'
    | 'lockfile'
    | 'generated'
    | 'empty-diff';

export function getSkipReason(filePath: string, isBinary: boolean, diffText: string): SkipReason | null {
    if (isBinary) return 'binary';

    const normalized = filePath.replace(/\\/g, '/');
    const segments = normalized.split('/');
    if (segments.some((segment) => SKIP_DIR_SEGMENTS.has(segment))) {
        return 'generated';
    }

    const basename = path.basename(filePath).toLowerCase();
    if (SKIP_FILENAMES.has(basename)) return 'lockfile';

    const ext = path.extname(basename).toLowerCase();
    if (SKIP_EXTENSIONS.has(ext)) return 'image-or-asset';

    if (basename.endsWith('.min.js') || basename.endsWith('.min.css')) {
        return 'generated';
    }

    const trimmedDiff = (diffText || '').trim();
    if (!trimmedDiff || /^Binary files .* differ$/i.test(trimmedDiff)) {
        return 'empty-diff';
    }

    return null;
}

export function skipMessage(reason: SkipReason, filePath: string): string {
    switch (reason) {
        case 'binary':
            return `Skipped AI review — ${filePath} is a binary file.`;
        case 'image-or-asset':
            return `Skipped AI review — ${filePath} is an image or media asset.`;
        case 'lockfile':
            return `Skipped AI review — ${filePath} is a lockfile.`;
        case 'generated':
            return `Skipped AI review — ${filePath} looks generated or vendored.`;
        case 'empty-diff':
            return `Skipped AI review — no text diff available for ${filePath}.`;
    }
}
