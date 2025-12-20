import os
import json
import dotenv
from google import genai
from google.genai.errors import ServerError

dotenv.load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "gemini-2.5-flash"


def generar_contenido(prompt: str) -> dict:
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )
        response_text = _limpiar_json(response.text)
        return json.loads(response_text)

    except ServerError as e:
        # Error del modelo (503, 500, etc)
        return {
            "error": True,
            "type": "MODEL_OVERLOADED",
            "message": "El modelo está ocupado en este momento. Intenta nuevamente en unos segundos."
        }

    except json.JSONDecodeError:
        return {
            "error": True,
            "type": "INVALID_JSON",
            "message": "La IA devolvió una respuesta inválida."
        }

    except Exception as e:
        return {
            "error": True,
            "type": "UNKNOWN",
            "message": str(e)
        }
    
def _limpiar_json(texto: str) -> str:
    texto = texto.strip()

    if texto.startswith("```"):
        texto = texto.replace("```json", "").replace("```", "").strip()

    return texto

def generar_recomendacion(tipo: str, metas: list[str]) -> dict:
    metas_texto = ", ".join(metas) if metas else "No especificadas"

    if tipo == "rutina":
        prompt = f"""
Responde SOLO con JSON válido. NO agregues texto adicional.

Reglas OBLIGATORIAS:
- Máximo 5 ejercicios
- El saludo debe tener máximo 20 palabras
- NO incluyas explicaciones extra
- Contenido conciso y claro

Formato EXACTO:
{{
  saludo: "string (saludo neutral, sin nombres propios)",
  "ejercicios": [
    {{
      "ejercicio": "string",
      "series": number,
      "repeticiones": number
    }}
  ]
}}

Metas del usuario:
{metas_texto}
"""
        return generar_contenido(prompt)

    elif tipo == "nutricion":
        prompt = f"""
Responde SOLO con JSON válido. NO agregues texto adicional.

Reglas OBLIGATORIAS:
- Máximo 5 ingredientes
- Máximo 4 pasos de preparación
- Descripción: máximo 25 palabras
- NO agregues consejos ni texto adicional

Formato EXACTO:
{{
  "titulo": "string",
  "descripcion": "string",
  "ingredientes": ["string"],
  "preparacion": ["string"],
  "calorias_aproximadas": number
}}

Metas del usuario:
{metas_texto}
"""
        return generar_contenido(prompt)

    else:
        return {
            "error": True,
            "type": "INVALID_TYPE",
            "message": "Tipo de recomendación no soportado."
        }
