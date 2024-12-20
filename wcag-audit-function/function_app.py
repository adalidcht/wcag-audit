import azure.functions as func
import logging
import json
from gpt_recommendation import get_recommendations
from blob_json import get_json_from_blob, save_recommendation

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

@app.route(route="wcag_recommendation")
def wcag_recommendation(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing WCAG recommendations request.')

    try:
        # Leer el cuerpo de la solicitud
        req_body = req.get_json()

        # Obtener el nombre del blob (report_id)
        report_id = req_body.get("report_id")

        # Validar la entrada
        if not report_id:
            return func.HttpResponse(
                "Request body must include a 'report_id' field.",
                status_code=400
            )

        # Descargar el JSON desde el contenedor 'wcag-reports'
        logging.info(f"Downloading JSON from blob: {report_id}.json")
        blob_data = get_json_from_blob(report_id)

        # Validar que exista el campo "data" y "violations" en el JSON descargado
        if not blob_data.get("data") or not blob_data["data"].get("violations"):
            return func.HttpResponse(
                "The blob must contain a 'data' field with a 'violations' field containing valid data.",
                status_code=400
            )

        violations = blob_data["data"]["violations"]

        # Generar recomendaciones basadas en las violaciones
        logging.info("Generating recommendations using GPT...")
        recommendations = get_recommendations(violations)

        # Guardar las recomendaciones en el contenedor 'wcag-recommendations'
        logging.info(f"Saving recommendations to blob: {report_id}_recommendations.json")
        recommendation_blob_name = save_recommendation(recommendations, report_id.replace(".json", ""))

        # Devolver solo el nombre del blob guardado
        return func.HttpResponse(
            json.dumps({"recommendation_blob_name": recommendation_blob_name}),
            mimetype="application/json",
            status_code=200
        )

    except Exception as e:
        logging.error(f"Error processing request: {e}")
        return func.HttpResponse(
            f"An error occurred: {str(e)}",
            status_code=500
        )
