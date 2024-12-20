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

def find_file_in_container(container_name, file_name):
    container_client = blob_service_client.get_container_client(container_name)
    blob_list = container_client.list_blobs()
    for blob in blob_list:
        if blob.name == file_name:
            return blob.name
    return None