import os
import json
import requests
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

# Cargar las variables de entorno
load_dotenv()

# Leer las claves desde variables de entorno
BLOB_CONNECTION_STRING = os.getenv("BLOB_CONNECTION_STRING")
CONTAINER_REPORTS = "wcag-reports"

# Crear el cliente de Blob Storage
blob_service_client = BlobServiceClient.from_connection_string(BLOB_CONNECTION_STRING)
container_report_client = blob_service_client.get_container_client(CONTAINER_REPORTS)

def upload_json_to_blob(json_data, blob_name):
    """
    Sube un JSON al contenedor wcag-reports.
    """
    try:
        blob_client = container_report_client.get_blob_client(blob_name)
        blob_client.upload_blob(json.dumps(json_data, indent=4), overwrite=True)
        print(f"JSON subido al blob: {blob_name}")
        return blob_name  # Devuelve solo el nombre del blob
    except Exception as e:
        raise RuntimeError(f"Error al subir el blob: {str(e)}")

def send_post_to_function(blob_name, function_url):
    """
    Envía un POST a la Azure Function con el nombre del blob.
    """
    try:
        # Crear el payload del POST con el nombre del blob
        payload = {"report_id": blob_name}  # Usamos 'report_id' en lugar de 'blob_url'
        headers = {"Content-Type": "application/json"}
        
        # Enviar la solicitud POST
        response = requests.post(function_url, json=payload, headers=headers)
        
        # Manejar la respuesta
        if response.status_code == 200:
            print("Respuesta de la Azure Function:")
            print(response.json())  # Esto debería incluir el nombre del blob de recomendación
        else:
            print(f"Error: {response.status_code}, {response.text}")
    except Exception as e:
        raise RuntimeError(f"Error al enviar el POST: {str(e)}")

# === Simulación del flujo ===

# 1. Crear un JSON de ejemplo
example_json = {
    "violations": [
        {
            "id": "aria-allowed-role",
            "description": "Ensures role attribute has an appropriate value for the element",
            "impact": "minor",
            "nodes": [{"id": "node1"}, {"id": "node2"}]
        },
        {
            "id": "color-contrast",
            "description": "Ensures sufficient color contrast between text and background",
            "impact": "major",
            "nodes": [{"id": "node3"}]
        }
    ]
}

# 2. Subir el JSON al contenedor wcag-reports
blob_name = "example_report.json"  # Nombre del archivo en el blob
upload_json_to_blob(example_json, blob_name)  # Subimos el JSON y obtenemos el nombre

# 3. Enviar un POST a la Azure Function con el nombre del blob
function_url = "http://localhost:7071/api/wcag_recommendation"  # URL de tu Azure Function
send_post_to_function(blob_name, function_url)  # Enviar solo el nombre del blob
