from flask import Flask, request, jsonify, render_template

import os
import json
import dotenv
import logging


dotenv.load_dotenv()

app = Flask(__name__)

@app.route('/app')
def app_front():
    return render_template('index.html')

@app.route('/generar_rutina', methods=['POST'])
def generar_rutina_endpoint():
    from recomendationAI import generar_rutina

    usuario_info = request.json.get('usuario_info', '')
    rutina = generar_rutina(usuario_info)
    return jsonify(rutina)

@app.route('/generar_receta', methods=['POST'])
def generar_receta_endpoint():
    from recomendationAI import generar_receta_saludable

    usuario_info = request.json.get('usuario_info', '')
    receta = generar_receta_saludable(usuario_info)
    return jsonify(receta)

os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    filename="logs/error.log",
    level=logging.ERROR,
    format="%(asctime)s %(levelname)s %(message)s"
)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
