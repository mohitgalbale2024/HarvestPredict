import os
import json
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
BEST_MODEL_PATH = MODELS_DIR / "best_model.joblib"
PREPROCESSOR_PATH = MODELS_DIR / "preprocessor.joblib"
METRICS_PATH = MODELS_DIR / "model_metrics.json"

ALLOWED_CROPS = ["Cotton", "Soybean", "Wheat", "Rice", "Maize", "Sugarcane", "Turmeric"]
ALLOWED_SEASONS = ["Kharif", "Rabi", "Summer"]
SUPPORTED_LOCATIONS = ["Maharashtra", "Amravati", "Vidarbha", "India"]
MODEL_VERSION = os.getenv("MODEL_VERSION", "1.0.0")


app = FastAPI(
    title="HarvestPredict Crop Yield Prediction API",
    description="ML-powered crop yield prediction service for Maharashtra/Amravati region",
    version=MODEL_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    crop: str = Field(..., description="Crop name (Cotton, Soybean, Wheat, Rice, Maize, Sugarcane, Turmeric)")
    area_hectares: float = Field(..., gt=0, description="Area in hectares (must be > 0)")
    rainfall_mm: float = Field(..., ge=0, description="Seasonal rainfall in millimeters")
    temperature: float = Field(..., description="Average temperature (Celsius)")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity percentage (0-100)")
    nitrogen: float = Field(..., ge=0, description="Soil Nitrogen (N) level kg/ha")
    phosphorus: float = Field(..., ge=0, description="Soil Phosphorus (P) level kg/ha")
    potassium: float = Field(..., ge=0, description="Soil Potassium (K) level kg/ha")
    ph: float = Field(..., ge=0, le=14, description="Soil pH (0-14)")
    season: str = Field(..., description="Crop season (Kharif, Rabi, Summer)")
    irrigation: int = Field(..., ge=0, le=1, description="1 if irrigated, 0 if rainfed")
    fertilizer_used: int = Field(..., ge=0, le=1, description="1 if fertilizers applied, 0 otherwise")

    @field_validator("crop")
    @classmethod
    def validate_crop(cls, v: str) -> str:
        if v not in ALLOWED_CROPS:
            raise ValueError(f"crop must be one of {ALLOWED_CROPS}")
        return v

    @field_validator("season")
    @classmethod
    def validate_season(cls, v: str) -> str:
        if v not in ALLOWED_SEASONS:
            raise ValueError(f"season must be one of {ALLOWED_SEASONS}")
        return v

    @field_validator("temperature")
    @classmethod
    def validate_temperature(cls, v: float) -> float:
        if v < 0 or v > 60:
            raise ValueError("temperature must be between 0 and 60 Celsius")
        return v


MODEL = None
PREPROCESSOR = None
MODEL_METRICS = None


@app.on_event("startup")
def load_artifacts():
    global MODEL, PREPROCESSOR, MODEL_METRICS
    MODEL = joblib.load(BEST_MODEL_PATH)
    PREPROCESSOR = joblib.load(PREPROCESSOR_PATH)
    with open(METRICS_PATH, "r") as f:
        MODEL_METRICS = json.load(f)


def preprocess_input(req: PredictRequest) -> pd.DataFrame:
    cat_cols = PREPROCESSOR["categorical_cols"]
    num_cols = PREPROCESSOR["numeric_cols"]
    feature_cols = PREPROCESSOR["feature_cols"]
    label_encoders = PREPROCESSOR["label_encoders"]
    scaler = PREPROCESSOR["scaler"]

    record = {
        "crop": req.crop,
        "season": req.season,
        "year": 2024,
        "rainfall_mm": req.rainfall_mm,
        "temperature": req.temperature,
        "humidity": req.humidity,
        "nitrogen": req.nitrogen,
        "phosphorus": req.phosphorus,
        "potassium": req.potassium,
        "ph": req.ph,
        "area_hectares": req.area_hectares,
        "irrigation": req.irrigation,
        "fertilizer_used": req.fertilizer_used,
    }

    encoded = {}
    for col in cat_cols:
        le = label_encoders[col]
        val = record[col]
        if val not in le.classes_:
            encoded[col] = 0
        else:
            encoded[col] = le.transform([val])[0]

    num_df = pd.DataFrame([{c: record[c] for c in num_cols}])
    scaled_np = scaler.transform(num_df)
    scaled_df = pd.DataFrame(scaled_np, columns=num_cols)

    final_df = pd.DataFrame([encoded])
    final_df = pd.concat([final_df.reset_index(drop=True), scaled_df.reset_index(drop=True)], axis=1)
    final_df = final_df[feature_cols]
    return final_df


def build_confidence_note(r2: float) -> str:
    if r2 >= 0.9:
        quality = "excellent"
    elif r2 >= 0.75:
        quality = "strong"
    elif r2 >= 0.6:
        quality = "moderate"
    elif r2 >= 0.4:
        quality = "fair"
    else:
        quality = "weak"
    return (
        f"Model R² = {r2:.4f} indicates {quality} predictive performance on held-out test data. "
        "R² (coefficient of determination) represents the proportion of yield variance explained by "
        "the model (0 = no better than predicting the mean, 1 = perfect prediction). "
        "This prediction should be used as an estimate alongside local agricultural expertise."
    )


@app.post("/predict")
def predict(req: PredictRequest):
    if MODEL is None or PREPROCESSOR is None or MODEL_METRICS is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        X = preprocess_input(req)
        predicted_yield = float(np.clip(MODEL.predict(X)[0], 0.01, None))
        predicted_production = round(predicted_yield * req.area_hectares, 4)
        predicted_yield = round(predicted_yield, 4)

        r2 = float(MODEL_METRICS["r2"])
        rmse = float(MODEL_METRICS["rmse"])
        mae = float(MODEL_METRICS["mae"])
        feature_importance = MODEL_METRICS.get("feature_importance", {})

        return {
            "predicted_yield": predicted_yield,
            "predicted_production": predicted_production,
            "unit_yield": "tons_per_hectare",
            "unit_production": "tons",
            "model_version": MODEL_VERSION,
            "model_metrics": {
                "r2": round(r2, 6),
                "rmse": round(rmse, 6),
                "mae": round(mae, 6),
            },
            "feature_importance": feature_importance,
            "confidence_note": build_confidence_note(r2),
            "input_summary": {
                "crop": req.crop,
                "season": req.season,
                "area_hectares": req.area_hectares,
                "irrigation": bool(req.irrigation),
                "fertilizer_used": bool(req.fertilizer_used),
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get("/health")
def health():
    model_loaded = MODEL is not None and PREPROCESSOR is not None
    return {
        "status": "ok" if model_loaded else "degraded",
        "service": "HarvestPredict ML Service",
        "model_loaded": model_loaded,
        "version": MODEL_VERSION,
    }


@app.get("/model-info")
def model_info():
    if MODEL_METRICS is None:
        raise HTTPException(status_code=500, detail="Model metrics not loaded")

    return {
        "model_name": MODEL_METRICS["best_model"],
        "model_version": MODEL_VERSION,
        "algorithm": MODEL_METRICS["best_model"],
        "training_region": "Maharashtra / Amravati (synthetic dataset)",
        "training_period": "2015-2024",
        "dataset_size": "5000 synthetic rows",
        "metrics": {
            "r2": round(float(MODEL_METRICS["r2"]), 6),
            "rmse": round(float(MODEL_METRICS["rmse"]), 6),
            "mae": round(float(MODEL_METRICS["mae"]), 6),
        },
        "supported_crops": ALLOWED_CROPS,
        "supported_seasons": ALLOWED_SEASONS,
        "supported_locations": SUPPORTED_LOCATIONS,
        "features": [
            "crop", "season", "year", "rainfall_mm", "temperature", "humidity",
            "nitrogen", "phosphorus", "potassium", "ph", "area_hectares",
            "irrigation", "fertilizer_used",
        ],
        "target": "yield_tons_per_hectare",
        "feature_importance": MODEL_METRICS.get("feature_importance", {}),
    }
