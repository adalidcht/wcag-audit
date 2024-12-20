import os
import json
import logging
from openai import AzureOpenAI
from dotenv import load_dotenv
from azure.functions import HttpRequest, HttpResponse

# Cargar las variables de entorno
load_dotenv()

# Configuración de OpenAI
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_version="2024-10-21"
)

# Función para obtener recomendaciones de OpenAI
def get_recommendations(violations):
    recommendations = {}
    context = """
    You are an expert in WCAG (Web Content Accessibility Guidelines) norms. Your role is to assist in providing detailed, actionable, and WCAG-compliant recommendations for improving web accessibility. 
    All suggestions must be practical, specific to the violation described, and implementable within this project.
    Do not redirect to external accessibility services, tools, or resources; focus exclusively on addressing the violations using WCAG-compliant methods.
    Your recommendations will be used as part of an automated WCAG-audit project.
    """

    for violation in violations:
        prompt = f"""
        The following violation was detected during a WCAG audit:
        Violation ID: {violation['id']}
        Description: {violation['description']}
        Impact: {violation.get('impact', 'not specified')}
        Nodes affected: {len(violation.get('nodes', []))} elements.
        Based on the WCAG normatives, provide specific recommendations to address this violation.
        """

        response = client.chat.completions.create(
            model="gpt-35-turbo", 
            messages=[
                {"role": "system", "content": context},
                {"role": "user", "content": prompt}
            ]
        )

        recommendations[violation['id']] = response.choices[0].message.content

    return recommendations

# Función principal que será ejecutada por el trigger HTTP
def main(req: HttpRequest) -> HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    # Leer el body del JSON de la solicitud
    try:
        req_body = req.get_json()
    except ValueError:
        return HttpResponse(
            "Invalid JSON received.",
            status_code=400
        )

    # Obtener las violaciones del JSON recibido
    violations = req_body.get("violations", None)

    if violations:
        # Obtener recomendaciones para las violaciones recibidas
        recommendations = get_recommendations(violations)

        # Crear el informe final con las recomendaciones
        report = {
            'violations': violations,
            'recommendations': recommendations
        }

        # Regresar el JSON con las recomendaciones
        return HttpResponse(
            json.dumps(report, indent=4),
            status_code=200,
            mimetype="application/json"
        )
    else:
        return HttpResponse(
            "No violations provided in JSON.",
            status_code=400
        )
