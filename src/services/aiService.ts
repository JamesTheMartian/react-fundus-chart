import { getColorContextForAI } from '../data/colorLegend';

export interface AIAnalysisResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

export const analyzeChart = async (imageData: string, apiKey: string, model: string = 'openai/gpt-4o'): Promise<AIAnalysisResponse> => {
    const colorContext = getColorContextForAI();
    const prompt = `Analyze this retinal fundus chart. Describe the findings (e.g., hemorrhages, exudates, detachment), potential diagnosis, and recommended actions. Be professional and concise.\n\n${colorContext}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'React Fundus Chart',
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: imageData } }
                    ]
                }
            ]
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to analyze chart');
    }

    return response.json();
};
