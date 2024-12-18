import os
import json
from dotenv import load_dotenv
from openai import AzureOpenAI

# Cargar variables de entorno
load_dotenv()


    
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),  
    api_version="2024-10-21",
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    )

completion = client.chat.completions.create(
  model="gpt-35-turbo", 
  messages=[
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "When was Microsoft founded?"}
  ]
)

print(completion.choices[0].message.content)