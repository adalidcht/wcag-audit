import os
from openai import AzureOpenAI
from dotenv import load_dotenv

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
        # Generar el prompt con los detalles de la violación
        prompt = f"""
        The following violation was detected during a WCAG audit:
        Violation ID: {violation['suggested_fix']}
        Description: {violation['description']}
        Impact: {violation.get('impact', 'not specified')}
        Nodes affected: {len(violation.get('affected_nodes', []))} elements.
        Based on the WCAG normatives, provide specific recommendations to address this violation.

        Your response must be in the form:
        recommendation: [Your recommendation here]
        """

        # Realizar la llamada a la API de OpenAI para obtener la recomendación
        response = client.chat.completions.create(
            model="gpt-35-turbo", 
            messages=[{"role": "system", "content": context}, 
                      {"role": "user", "content": prompt}]
        )

        # Añadir las recomendaciones específicas de la violación
        recommendations[violation['id']] = response.choices[0].message.content.strip()

    return recommendations
