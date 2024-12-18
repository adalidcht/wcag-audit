import os
import json
from flask import Flask, render_template, request, jsonify
from openai import AzureOpenAI
from dotenv import load_dotenv
from selenium import webdriver
from axe_selenium_python import Axe
from azure.storage.blob import BlobServiceClient
from selenium.webdriver.chrome.options import Options

# Cargar las variables de entorno
load_dotenv()

# Configuración de Azure
connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
container_name = os.getenv("AZURE_CONTAINER_NAME")

blob_service_client = BlobServiceClient.from_connection_string(connection_string)

# Configuración de OpenAI
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version="2024-10-21",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

# Función para analizar accesibilidad con axe-core
def analyze_accessibility(url):
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")

    driver = webdriver.Chrome(options=options)
    driver.get(url)
    print("Título de la página:", driver.title)

    axe = Axe(driver)
    axe.inject()
    results = axe.run()
    driver.quit()

    return results

# Función para obtener recomendaciones de OpenAI
def get_recommendations(violations):
    recommendations = {}
    context = "You are an expert in WCAG normatives."
    for violation in violations:
        prompt = f"Recomendación para la violación de accesibilidad: {violation['description']}. ¿Cómo se puede mejorar?"
        response = client.chat.completions.create(
            model="gpt-35-turbo",
            messages=[
                {"role": "system", "content": context},
                {"role": "user", "content": prompt}
            ]
        )
        recommendations[violation['id']] = response.choices[0].message.content
    return recommendations

# Función para guardar los resultados en Azure Blob Storage
def save_to_blob_storage(filename, data):
    blob_client = blob_service_client.get_blob_client(container=container_name, blob=filename)
    blob_client.upload_blob(data, overwrite=True)

# Función para leer un archivo desde Azure Blob Storage
def read_from_blob_storage(filename):
    try:
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=filename)
        blob_data = blob_client.download_blob().readall()
        return json.loads(blob_data)
    except Exception as e:
        return None

# Inicializar la aplicación Flask
app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        url = request.form.get("url")
        filename = f"accessibility_report_{url.replace('https://', '').replace('/', '_')}.json"

        # Comprobar si el informe ya existe
        existing_report = read_from_blob_storage(filename)
        if existing_report:
            return render_template("report.html", report=json.dumps(existing_report, indent=4))
        else:
            # Realizar análisis y generar informe
            results = analyze_accessibility(url)
            violations = results['violations']
            recommendations = get_recommendations(violations)
            
            report = {
                'url': url,
                'violations': violations,
                'recommendations': recommendations,
                'score': len(violations)  # Ajusta el cálculo del puntaje si es necesario
            }

            # Guardar el informe en Blob Storage
            save_to_blob_storage(filename, json.dumps(report, indent=4))

            return render_template("report.html", report=json.dumps(report, indent=4))
    return render_template("index.html")

# Archivos HTML
HTML_INDEX = """
<!DOCTYPE html>
<html>
<head>
    <title>WCAG Accessibility Audit</title>
</head>
<body>
    <h1>WCAG Accessibility Audit</h1>
    <form method="POST">
        <label for="url">Ingrese la URL para analizar:</label>
        <input type="text" id="url" name="url" required>
        <button type="submit">Analizar</button>
    </form>
</body>
</html>
"""

HTML_REPORT = """
<!DOCTYPE html>
<html>
<head>
    <title>Accessibility Report</title>
    <style>
        pre {
            background-color: #f8f9fa;
            padding: 1rem;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-family: monospace;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <h1>Reporte de Accesibilidad</h1>
    <a href="/">Volver</a>
    <pre>{{ report }}</pre>
</body>
</html>
"""

# Guardar archivos HTML en el sistema de archivos
os.makedirs("templates", exist_ok=True)
with open("templates/index.html", "w") as f:
    f.write(HTML_INDEX)
with open("templates/report.html", "w") as f:
    f.write(HTML_REPORT)

if __name__ == "__main__":
    app.run(debug=True)
