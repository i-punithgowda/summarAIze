import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    private initialize() {
        if (this.genAI) return; // Already initialized

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your-api-key-here') {
            throw new Error('GEMINI_API_KEY is not set or invalid. Please set it in the .env file.');
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        // Using gemini-2.5-pro - latest and most capable model
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    async generateSummary(diff: string, reviewRules?: string): Promise<{ summary: string; suggestions: string[] }> {
        try {
            this.initialize(); // Initialize on first use

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

            const startTime = Date.now();
            console.log(`   ⏳ Sending to Gemini... (${diff.length} chars)`);

            const result = await this.model.generateContent(prompt);
            const response = await result.response;

            const elapsed = Date.now() - startTime;
            console.log(`   ⚡ Gemini responded in ${elapsed}ms`);
            const resultText = response.text();

            // Parse summary and suggestions
            let summary = '';
            const suggestions: string[] = [];

            if (resultText.includes('SUMMARY:')) {
                const parts = resultText.split('SUGGESTIONS:');
                summary = parts[0].replace('SUMMARY:', '').trim();

                if (parts.length > 1) {
                    const suggestionsText = parts[1].trim();
                    // Extract bullet points
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
                // If format not followed, just use the whole response as summary
                summary = resultText;
            }

            return { summary, suggestions };
        } catch (error: any) {
            console.error('Gemini API error:', error);
            return {
                summary: `AI summary error: ${error.message}`,
                suggestions: []
            };
        }
    }
}

export default new GeminiService();

