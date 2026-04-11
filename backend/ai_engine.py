import os
import json
from openai import AsyncOpenAI
from dotenv import load_dotenv
from models import WeighmentData

load_dotenv()

# We still use the versatile openai python package! 
# But we point it strictly to your localized hardware port (e.g., Ollama).
# The api_key parameter doesn't matter for local deployments, so we use dummy text.
# Determine if we should use Cloud or Local
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
OPENAI_KEY = os.environ.get("OPENAI_API_KEY") or os.environ.get("GROQ_API_KEY")

cloud_key = GEMINI_KEY or OPENAI_KEY
AI_MODEL = os.environ.get("PRODUCTION_MODEL_NAME") or ("gemini-1.5-flash" if GEMINI_KEY else os.environ.get("LOCAL_MODEL_NAME", "llama3"))
AI_BASE_URL = os.environ.get("LOCAL_AI_ENDPOINT", "http://localhost:11434/v1")

# Gemini uses a specific OpenAI-compatible endpoint
GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/"
cloud_endpoint = os.environ.get("CLOUD_AI_ENDPOINT") or (GEMINI_ENDPOINT if GEMINI_KEY else None)

use_cloud = cloud_key and not os.environ.get("FORCE_LOCAL_AI")

client = AsyncOpenAI(
    base_url=cloud_endpoint if use_cloud else AI_BASE_URL,
    api_key=cloud_key if use_cloud else "ollama-local"
)

MODEL_NAME = AI_MODEL

async def extract_weighment_data(raw_text: str, past_corrections: list = None, retry_count=0) -> dict:
    """
    Use localized ML Model to extract weighment details into a structured JSON dictionary.
    Supports a fallback retry if JSON formatting or validation fails.
    """
    system_prompt = (
        "You are an expert AI designed to parse weighbridge slip PDFs. "
        "Strictly extract weighment details from the text and return ONLY valid JSON with keys: "
        "vehicle_number, gross_weight, tare_weight, net_weight, material, date, time, party_name, slip_number. "
        "Ensure weight values are integers. Return null if a value is not found. "
        "Normalize vehicle_number by removing spaces and capitalizing."
    )

    if past_corrections and len(past_corrections) > 0:
        system_prompt += "\n\nLearn from these past human corrections:\n"
        for c in past_corrections:
            system_prompt += f"Original: {json.dumps(c.get('original_data', {}))}\n"
            system_prompt += f"Corrected: {json.dumps(c.get('corrected_data', {}))}\n"

    try:
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            response_format={ "type": "json_object" }, 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Text to parse:\n{raw_text}"}
            ],
            temperature=0.1 if retry_count == 0 else 0.4
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        
        # Test Validation via Pydantic model
        validated = WeighmentData(**data)
        return validated.dict(exclude_unset=True, exclude_none=True)
        
    except Exception as e:
        print(f"AI Extraction error on {MODEL_NAME} (attempt {retry_count+1}): {str(e)}")
        if retry_count < 1:
            print("Retrying with simplified prompt...")
            # Retry mechanism
            return await extract_weighment_data(raw_text, past_corrections, retry_count=1)
        
        # If all fails, raise it to be caught by the watcher for error_logs
        raise ValueError(f"Failed to reliably parse PDF using local AI ({MODEL_NAME}): {str(e)}")
