import os
import json
import dotenv
from google import genai

dotenv.load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "gemini-2.5-flash"



def generar_rutina(usuario_info: str) -> dict:
    """
    Genera una rutina de entrenamiento en formato JSON
    a partir de la información del usuario.
    """

    prompt = f"""
    Genera una rutina de entrenamiento en formato JSON EXACTO:

    {{
      "saludo": "string",
      "ejercicios": [
        {{
          "ejercicio": "string",
          "series": number,
          "repeticiones": number
        }}
      ]
    }}

    Usuario:
    {usuario_info}
    """

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )

    try:
        texto_limpio =_limpiar_json(response.text)
        return json.loads(texto_limpio)
    except json.JSONDecodeError:
        raise ValueError("La IA no devolvió un JSON válido")

def generar_receta_saludable(usuario_info: str) -> dict:
    """
    Genera una receta saludable del día en formato JSON
    a partir de la información del usuario.
    """

    prompt = f"""
    Responde SOLO con JSON válido. No agregues texto adicional.

    Genera una receta saludable para el día de hoy en el siguiente formato EXACTO:

    {{
      "titulo": "string",
      "descripcion": "string",
      "ingredientes": [
        "string"
      ],
      "preparacion": [
        "string"
      ],
      "calorias_aproximadas": number,
      "macros": {{
        "proteinas_g": number,
        "carbohidratos_g": number,
        "grasas_g": number
      }}
    }}

    Usuario:
    {usuario_info}
    """

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )
    
    try:
        texto_limpio =_limpiar_json(response.text)
        return json.loads(texto_limpio)
    except json.JSONDecodeError:
        raise ValueError("La IA no devolvió un JSON válido")


def _limpiar_json(texto: str) -> str:
    texto = texto.strip()

    if texto.startswith("```"):
        texto = texto.replace("```json", "").replace("```", "").strip()

    return texto