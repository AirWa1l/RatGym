from flask import Flask, request, jsonify, render_template
import os
import dotenv
import logging

dotenv.load_dotenv()

app = Flask(__name__)

# 👉 Ruta raíz: carga directamente el frontend
@app.route('/')
def index():
    return render_template('index.html')

# (Opcional) mantener /app si ya lo usabas
@app.route('/app')
def app_front():
    return render_template('index.html')

@app.route('/recomendacion', methods=['POST'])
def recomendacion():
    from recomendationAI import generar_recomendacion

    data = request.get_json()

    tipo = data.get("tipo")           # "rutina" | "nutricion"
    metas = data.get("metas", [])     # lista de strings

    resultado = generar_recomendacion(tipo, metas)

    if resultado.get("error"):
        return jsonify(resultado), 503

    return jsonify(resultado)

# ---------- LOGS ----------
os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    filename="logs/error.log",
    level=logging.ERROR,
    format="%(asctime)s %(levelname)s %(message)s"
)

# ---------- RUN ----------
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=3007,   # 👈 puerto corregido
        debug=True
    )
