import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

@Injectable()
export class AiService {

  async generateRecommendation(plan: any): Promise<string> {
    try {
      const prompt = `
Eres un asistente de nutrición.
Objetivo: ${plan.objective}
Calorías: ${plan.calories}
Proteínas: ${plan.protein}g

Genera una recomendación corta (máx 2 frases).
`;

      const response = await fetch(
        'http://llama-service:11434/api/generate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3.2',
            prompt,
            stream: false,
          }),
        },
      );

      const data: any = await response.json();
      return data.response;

    } catch (error) {
      console.error('LLaMA error:', error);
      return 'Mantén una alimentación equilibrada y una buena hidratación.';
    }
  }
}
