import json
import os
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

# Cargar las variables de entorno
load_dotenv()

# Leer las claves desde variables de entorno
BLOB_CONNECTION_STRING = os.getenv("BLOB_CONNECTION_STRING")
CONTAINER_REPORTS = "wcag-reports"
CONTAINER_RECOMMENDATIONS = "wcag-recommendation"

# Cliente de Blob Storage
blob_service_client = BlobServiceClient.from_connection_string(BLOB_CONNECTION_STRING)
container_report_client = blob_service_client.get_container_client(CONTAINER_REPORTS)
container_recommendation_client = blob_service_client.get_container_client(CONTAINER_RECOMMENDATIONS)

def get_json_from_blob(blob_name):
    """
    Descarga un JSON desde el contenedor `wcag-reports` y lo convierte en un objeto Python.
    """
    try:
        blob_client = container_report_client.get_blob_client(blob_name)
        blob_data = blob_client.download_blob().readall()
        
        return json.loads(blob_data)
    
    except Exception as e:
        raise RuntimeError(f"Error al descargar el blob {blob_name}: {str(e)}")

def save_recommendation(recommendation, report_id):
    """
    Guarda un objeto JSON como un blob en el contenedor 'wcag-recommendations'.
    Y devuelve el nombre del blob donde se guardaron las recomendaciones.
    """
    try:
        blob_name = f"{report_id}_gpt_recommendations.json"
        blob_client = container_recommendation_client.get_blob_client(blob_name)
        blob_client.upload_blob(json.dumps(recommendation, indent=4), overwrite=True)

        # Devuelve el nombre del blob guardado
        return blob_name
    except Exception as e:
        raise RuntimeError(f"Error al guardar la recomendación: {str(e)}")