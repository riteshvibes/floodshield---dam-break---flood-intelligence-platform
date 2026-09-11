from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from features import FEATURES, HORIZONS, clean_input

ROOT = Path(__file__).parent
MODEL_DIR = ROOT / "models"
METADATA_PATH = MODEL_DIR / "model_metadata.json"


def load_metadata() -> dict[str, Any]:
    if not METADATA_PATH.exists():
        raise FileNotFoundError("Local model is not trained. Run python backend/ml/train.py first.")
    return json.loads(METADATA_PATH.read_text(encoding="utf-8"))


def predict(payload: dict[str, Any]) -> dict[str, Any]:
    metadata = load_metadata()
    values = clean_input(payload)
    frame = pd.DataFrame([[values[name] for name in FEATURES]], columns=FEATURES)
    forecasts: list[dict[str, Any]] = []
    uncertainty: list[dict[str, Any]] = []
    for horizon in HORIZONS:
        model_path = MODEL_DIR / f"discharge_{horizon}h.joblib"
        model = joblib.load(model_path)
        tree_predictions = [float(tree.predict(frame)[0]) for tree in model.estimators_]
        value = max(0.0, float(sum(tree_predictions) / len(tree_predictions)))
        spread = float(pd.Series(tree_predictions).std(ddof=1)) if len(tree_predictions) > 1 else 0.0
        forecasts.append({"horizonHours": horizon, "predictedDischarge": round(value, 2)})
        uncertainty.append({"horizonHours": horizon, "stdDev": round(spread, 2), "method": "Random forest tree spread; not a calibrated confidence interval"})
    next_hour = forecasts[0]["predictedDischarge"]
    severity = "LOW" if next_hour < 800 else "MEDIUM" if next_hour < 2000 else "HIGH" if next_hour < 5000 else "CRITICAL"
    dataset = pd.read_csv(ROOT / "data" / "demo_discharge.csv", parse_dates=["timestamp"]).tail(12)
    historical = [
        {"timestamp": row.timestamp.isoformat(), "actualDischarge": round(float(row.target_discharge_1h), 2)}
        for row in dataset.itertuples()
    ]
    return {
        "forecasts": forecasts,
        "predictedDischarge": next_hour,
        "forecastHorizon": "1 hour",
        "floodSeverity": severity,
        "model": metadata["model"],
        "modelVersion": metadata["modelVersion"],
        "training": metadata,
        "input": values,
        "historical": historical,
        "uncertainty": uncertainty,
    }
