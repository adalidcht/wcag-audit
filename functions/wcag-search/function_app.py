import azure.functions as func
import logging
import json
from search_database import find_file_in_container

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

@app.route(route="searchNretrieve")
def searchNretrieve(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing search request.')

    try:
         
        # Read the request body
        req_body = req.get_json()

        # Get the URL from the query string
        url = req_body.get("url")
        if not url:
            return func.HttpResponse(
                "Please pass a URL in the query string.",
                status_code=400
            )
        
        # Search for the files in their respective containers
        report_file_name = f"report_{url}.json"
        recommendation_file_name = f"{url}_gpt_recommendations.json"

        logging.info(f"Searching for the files requested: reporte_{report_file_name}.json and {recommendation_file_name}_gpt_recommendations.json")
        report_file = find_file_in_container("wcag-reports", report_file_name)
        recommendation_file = find_file_in_container("wcag-recommendation", recommendation_file_name)

        # Build the response
        response = {}
        if report_file:
            logging.info(f"reporte_{url}.json Found")
            response["wcag-report"] = report_file
        else:
            logging.info(f"reporte_{url}.json NOT Found")
            response["wcag-report"] = "File not found"

        if recommendation_file:
            logging.info(f"{url}_gpt_recommendations.json Found")
            response["wcag-recommendation"] = recommendation_file
        else:
            logging.info(f"{url}_gpt_recommendations.json NOT Found")
            response["wcag-recommendation"] = "File not found"

        return func.HttpResponse(
            body=str(response),
            status_code=200
        )
    except Exception as e:
            logging.error(f"Error processing request: {e}")
            return func.HttpResponse(
                f"An error occurred: {str(e)}",
                status_code=500
            )
