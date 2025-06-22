from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn

import uuid 
import requests

app = FastAPI(title="Weather Data System", version="1.0.0")

# API access: deb398ebab87f808efa7ce30cf22ae34

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}
API_KEY = "deb398ebab87f808efa7ce30cf22ae34"

class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    """
    You need to implement this endpoint to handle the following:
    1. Receive form data (date, location, notes)
    2. Calls WeatherStack API for the location
    3. Stores combined data with unique ID in memory
    4. Returns the ID to frontend
    """

    try:
        res = requests.get(
            "http://api.weatherstack.com/current",
            params={
                "access_key": API_KEY,
                "query": request.location,
                "units": "m"  # this is optional
            },
            timeout=5
        )
    except requests.exceptions.RequestException:
        raise HTTPException(status_code=503, detail="Weather API unavailable")

    if res.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch weather data")

    data = res.json()

    weather_id = str(uuid.uuid4())
    weather_storage[weather_id] = {
        "date": request.date,
        "location": request.location,
      "notes": request.notes,
        "weather": data
    }

    return WeatherResponse(id=weather_id)

@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    return weather_storage[weather_id]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)