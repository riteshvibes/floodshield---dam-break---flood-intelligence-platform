from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from config import DATA_PATH, MODEL_DIR
from features import FEATURES, HORIZONS
from preprocess import chronological_split, load_and_clean


def evaluate() -> dict:
    data = load_and_clean(str(DATA_PATH))
    _, _, test = chronological_split(data)
    metrics = {}
    for horizon in HORIZONS:
        model = joblib.load(MODEL_DIR / f"discharge_{horizon}h.joblib")
        target = f"target_discharge_{horizon}h"
        predictions = model.predict(test[FEATURES])
        metrics[str(horizon)] = {
            "mae": round(float(mean_absolute_error(test[target], predictions)), 4),
            "rmse": round(float(mean_squared_error(test[target], predictions) ** 0.5), 4),
            "r2": round(float(r2_score(test[target], predictions)), 4),
        }
    return {"records": len(data), "testRecords": len(test), "metrics": metrics}


if __name__ == "__main__":
    try:
        print(json.dumps(evaluate(), indent=2))
    except Exception as error:
        print(json.dumps({"error": str(error)}))
        sys.exit(1)
