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
    You are an expert in WCAG (Web Content Accessibility Guidelines) norms. Your role is to assist both technical and non-technical audiences by providing clear, actionable, and WCAG-compliant recommendations for improving web accessibility.  

    Your suggestions must:
    1. Be practical, specific to the described violation, and implementable within a web development context.
    2. Use a formal tone, avoiding technical jargon when unnecessary to ensure clarity for all audiences.  
    3. Provide code examples only when essential for clarity, while avoiding detailed implementation instructions.  
    4. Focus solely on addressing the violations using WCAG-compliant methods. Do not reference or redirect to external services, tools, or resources.  
    5. Instead of simply addressing the use of WCAG guidelines, explicitly describe the specific WCAG guidelines that are relevant to the violation and explain their significance in resolving the issue.
    
    You are part of a proprietary tool designed to provide these recommendations directly. You must not mention or rely on external tools or resources, as your guidance will form the core of this system’s functionality.  

    Your recommendations will contribute to an automated WCAG-audit project. Ensure they address the most relevant WCAG criteria effectively while maintaining accessibility for all user groups.  
    """

    for violation in violations:
        # Generar el prompt con los detalles de la violación
        prompt = f"""
        The following violation was detected during a WCAG audit:
        Violation ID: {violation.get('suggested_fix', 'No ID')}
        Description: {violation['description']}
        Impact: {violation.get('impact', 'not specified')}
        Number of affected nodes: {violation['nodes']}.
        Based on the WCAG guidelines, provide specific recommendations to address this violation.

        Your response must be in the form:
        recommendation: [Your recommendation here]
        """

        try:
            response = client.chat.completions.create(
                model="gpt-35-turbo",  
                messages=[
                    {"role": "system", "content": context},
                    {"role": "user", "content": prompt}
                ]
            )
            # Extraer y guardar la recomendación
            recommendation = response.choices[0].message.content.strip()
            recommendations[violation.get('suggested_fix', 'No ID')] = recommendation

        except Exception as e:
            error = f"Error processing violation {violation.get('suggested_fix', 'No ID')}: {e}"
            recommendations[violation.get('suggested_fix', 'No ID')] = f"Error generating recommendation: {error}"

    return recommendations
