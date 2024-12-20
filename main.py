import os
import json
from openai import AzureOpenAI
from dotenv import load_dotenv
from selenium import webdriver
from axe_selenium_python import Axe
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
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
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    )

# Función para analizar accesibilidad con axe-core
def analyze_accessibility(url):
    # Configura las opciones de Chrome para ejecutarlo en modo headless
    options = Options()
    options.add_argument("--headless")  # Ejecutar en modo headless
    options.add_argument("--no-sandbox")  # Necesario en contenedores como Docker
    options.add_argument("--disable-dev-shm-usage")  # Soluciona problemas de memoria
    options.add_argument("--remote-debugging-port=9222")  # Habilita la depuración remota
    options.add_argument("--disable-gpu")  # Deshabilita la aceleración de hardware

    # Establece el path correcto para el ChromeDriver
    driver = webdriver.Chrome(options=options)

    driver.get(url)
    print("Título de la página:", driver.title)

    # Ejecutar análisis de accesibilidad con axe-core
    axe = Axe(driver)
    axe.inject()
    results = axe.run()
    driver.quit()

    return results

# Función para obtener recomendaciones de OpenAI
def get_recommendations(violations):
    recommendations = {}
    # Contexto sólido para enmarcar las respuestas
    context = """
    You are an expert in WCAG (Web Content Accessibility Guidelines) norms. Your role is to assist in providing detailed, actionable, and WCAG-compliant recommendations for improving web accessibility. 
    All suggestions must be practical, specific to the violation described, and implementable within this project.
    Do not redirect to external accessibility services, tools, or resources; focus exclusively on addressing the violations using WCAG-compliant methods.
    Your recommendations will be used as part of an automated WCAG-audit project.
    """

    for violation in violations:
        # Prompt claro y dirigido a cada violación
        prompt = f"""
        The following violation was detected during a WCAG audit:
        Violation ID: {violation['id']}
        Description: {violation['description']}
        Impact: {violation.get('impact', 'not specified')}
        Nodes affected: {len(violation.get('nodes', []))} elements.

        Based on the WCAG normatives, provide specific recommendations to address this violation.
        Your response must be direct, actionable, and relevant to the WCAG-audit project.
        """

        # Generar respuesta con GPT
        response = client.chat.completions.create(
            model="gpt-35-turbo", 
            messages=[
                {"role": "system", "content": context},
                {"role": "user", "content": prompt}
            ]
        )

        # Guardar la recomendación
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

# Función principal
def main():
    url = input("Ingrese la URL para analizar: ")
    filename = f"accessibility_report_{url.replace('https://', '').replace('/', '_')}.json"

    # Comprobar si el archivo ya existe en Blob Storage
    existing_report = read_from_blob_storage(filename)
    if existing_report:
        print("El informe de accesibilidad ya existe. Cargando desde almacenamiento...")
        print(json.dumps(existing_report, indent=4))
    else:
        print("Realizando el análisis de accesibilidad...")
        results = analyze_accessibility(url)
        
        # Procesar violaciones y obtener recomendaciones
        violations = results['violations']
        recommendations = get_recommendations(violations)
        
        # Crear el informe final
        report = {
            'url': url,
            'violations': violations,
            'recommendations': recommendations,
            'score': len(violations)  # Puedes ajustar el cálculo del puntaje
        }
        
        # Guardar el informe en Azure Blob Storage
        save_to_blob_storage(filename, json.dumps(report, indent=4))
        
        # Mostrar el informe generado
        print("Informe generado y guardado en Blob Storage.")
        print(json.dumps(report, indent=4))

if __name__ == "__main__":
    main()
