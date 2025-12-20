import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  async generateRecommendation(plan: any): Promise<string> {

    const prompt = `
Eres un nutricionista profesional.

Datos del usuario:
- Calorías diarias: ${plan.calories} kcal
- Proteínas: ${plan.protein} g
- Carbohidratos: ${plan.carbs} g
- Grasas: ${plan.fat} g
- Objetivo: ${plan.objective}

Genera un plan de alimentación diario con:
- Desayuno
- Almuerzo
- Cena
- Snacks

Sé específico con los alimentos.
No incluyas explicaciones largas.
`;

    // 🔑 CLAVE
    const LLAMA_BASE_URL =
      process.env.LLAMA_BASE_URL || 'http://localhost:11434';

    try {
        const response = await axios.post(
    `${process.env.LLAMA_BASE_URL}/api/generate`,
    {
      model: 'llama3.2',
      prompt,
      stream: false,
      options: {
        num_predict: 150,      
        temperature: 0.6,
        top_p: 0.9
      }
    },
    {
      timeout: 180000
    }
  );


      return response.data.response;

    } catch (error: any) {
      console.error('❌ ERROR IA:', error.message);

      // 🟡 Fallback
      return `
Desayuno:
Avena con 2 huevos y una banana.

Almuerzo:
Arroz integral con pechuga de pollo y vegetales.

Cena:
Ensalada con atún, aguacate y aceite de oliva.

Snack:
Yogur griego con frutos secos.
`;
    }
  }
}

