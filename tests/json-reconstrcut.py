import requests
import json

# Definir la URL del servicio de Azure (reemplazar con la correcta)
url = "http://localhost:7071/api/wcag_recommendation"

# Datos a enviar en el POST
data = {
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

# Enviar el POST request
response = requests.post(url, json=data)

# Verificar si la solicitud fue exitosa
if response.status_code == 200:
    print("Solicitud exitosa, guardando el archivo JSON.")
    
    # Guardar la respuesta en un archivo JSON
    with open('response.json', 'w') as json_file:
        json.dump(response.json(), json_file, indent=4)
else:
    print(f"Error en la solicitud: {response.status_code} - {response.text}")
