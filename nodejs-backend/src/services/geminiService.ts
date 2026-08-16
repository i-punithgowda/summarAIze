import { GoogleGenerativeAI } from '@google/generative-ai';

const DEFAULT_MAX_RPM = 4;
const DEFAULT_MAX_RETRIES = 4;
const DEFAULT_MAX_DIFF_CHARS = 30000;

export class GeminiRateLimitError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GeminiRateLimitError';
    }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (error: any): boolean => {
    const message = String(error?.message || '');
    return (
        error?.status === 429 ||
        error?.statusText === 'Too Many Requests' ||
        /429|too many requests|quota exceeded|rate.?limit/i.test(message)
    );
};

const getRetryDelayMs = (error: any): number => {
    const details = error?.errorDetails;
    if (Array.isArray(details)) {
        const retryInfo = details.find(
            (item: any) => item?.retryDelay || String(item?.['@type'] || '').includes('RetryInfo')
        );
        if (retryInfo?.retryDelay) {
            const seconds = parseFloat(String(retryInfo.retryDelay).replace(/s$/i, ''));
            if (!Number.isNaN(seconds)) {
                return Math.ceil(seconds * 1000) + 750;
            }
        }
    }

    const match = String(error?.message || '').match(/Please retry in ([\d.]+)\s*s/i);
    if (match) {
        return Math.ceil(parseFloat(match[1]) * 1000) + 750;
    }

    return 20000;
};

class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;
    private requestTimestamps: number[] = [];

    private initialize() {
        if (this.genAI) return;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your-api-key-here') {
            throw new Error('GEMINI_API_KEY is not set or invalid. Please set it in the .env file.');
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    private getMaxRpm(): number {
        const parsed = Number(process.env.GEMINI_MAX_RPM);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_RPM;
    }

    private async waitForRateSlot(): Promise<void> {
        const maxRpm = this.getMaxRpm();

        while (true) {
            const now = Date.now();
            this.requestTimestamps = this.requestTimestamps.filter((stamp) => now - stamp < 60_000);

            if (this.requestTimestamps.length < maxRpm) {
                this.requestTimestamps.push(now);
                return;
            }

            const waitMs = 60_000 - (now - this.requestTimestamps[0]) + 250;
            console.log(`   ⏳ Rate limiter: waiting ${Math.ceil(waitMs / 1000)}s to stay under ${maxRpm} RPM`);
            await sleep(waitMs);
        }
    }

    private buildPrompt(diff: string, reviewRules?: string): string {
        let prompt = `Analyze the following git diff and provide:
1. A concise summary of the changes
2. Suggestions for improvement (if any)`;

        if (reviewRules) {
            prompt += `\n\n⚠️ IMPORTANT - Custom Review Rules to Check:
${reviewRules}

Please specifically check if the code violates any of these rules. If it does, highlight the violations prominently in your suggestions with a "⚠️ RULE VIOLATION:" prefix.`;
        }

        prompt += `

Git Diff:
${diff}

Please structure your response as:
SUMMARY: [your summary here]
SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]
- ⚠️ RULE VIOLATION: [if any rule is violated, mention it here]
etc.`;

        return prompt;
    }

    private parseResponse(resultText: string): { summary: string; suggestions: string[] } {
        let summary = '';
        const suggestions: string[] = [];

        if (resultText.includes('SUMMARY:')) {
            const parts = resultText.split('SUGGESTIONS:');
            summary = parts[0].replace('SUMMARY:', '').trim();

            if (parts.length > 1) {
                const suggestionsText = parts[1].trim();
                for (const line of suggestionsText.split('\n')) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
                        suggestions.push(trimmedLine.substring(1).trim());
                    } else if (trimmedLine && !trimmedLine.startsWith('SUMMARY')) {
                        suggestions.push(trimmedLine);
                    }
                }
            }
        } else {
            summary = resultText;
        }

        return { summary, suggestions };
    }

    async generateSummary(diff: string, reviewRules?: string): Promise<{ summary: string; suggestions: string[] }> {
        this.initialize();

        const maxDiffChars = Number(process.env.GEMINI_MAX_DIFF_CHARS) || DEFAULT_MAX_DIFF_CHARS;
        const truncatedDiff =
            diff.length > maxDiffChars
                ? `${diff.slice(0, maxDiffChars)}\n\n[Diff truncated for AI review — ${diff.length} chars total]`
                : diff;

        const prompt = this.buildPrompt(truncatedDiff, reviewRules);
        const maxRetries = Number(process.env.GEMINI_MAX_RETRIES) || DEFAULT_MAX_RETRIES;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await this.waitForRateSlot();

                const startTime = Date.now();
                console.log(`   ⏳ Sending to Gemini... (${truncatedDiff.length} chars)`);

                const result = await this.model.generateContent(prompt);
                const response = await result.response;
                const elapsed = Date.now() - startTime;
                console.log(`   ⚡ Gemini responded in ${elapsed}ms`);

                return this.parseResponse(response.text());
            } catch (error: any) {
                if (isRateLimitError(error) && attempt < maxRetries) {
                    const delayMs = getRetryDelayMs(error);
                    console.warn(
                        `   ⚠️ Gemini rate limited (attempt ${attempt}/${maxRetries}). Retrying in ${Math.ceil(delayMs / 1000)}s`
                    );
                    await sleep(delayMs);
                    continue;
                }

                if (isRateLimitError(error)) {
                    console.error('Gemini API rate limit persisted after retries:', error?.message || error);
                    throw new GeminiRateLimitError(
                        'Gemini rate limit exceeded. Remaining files were not sent to AI.'
                    );
                }

                console.error('Gemini API error:', error);
                return {
                    summary: `AI summary error: ${error.message}`,
                    suggestions: [],
                };
            }
        }

        throw new GeminiRateLimitError('Gemini rate limit exceeded. Remaining files were not sent to AI.');
    }
}

export default new GeminiService();
