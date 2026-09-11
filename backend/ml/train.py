from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from config import DATA_PATH, MODEL_DIR, MODEL_VERSION, MINIMUM_RECORDS
from features import FEATURES, HORIZONS
from preprocess import chronological_split, load_and_clean


def train() -> dict:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}. Run create_demo_dataset.py first.")
    data = load_and_clean(str(DATA_PATH))
    if len(data) < MINIMUM_RECORDS:
        raise ValueError(f"At least {MINIMUM_RECORDS} clean chronological records are required for training.")

    train_frame, validation_frame, test_frame = chronological_split(data)
    metrics: dict[str, dict[str, float]] = {}
    feature_importance: dict[str, float] = {}
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    for horizon in HORIZONS:
        target = f"target_discharge_{horizon}h"
        model = RandomForestRegressor(n_estimators=180, max_depth=12, random_state=42, n_jobs=-1)
        model.fit(train_frame[FEATURES], train_frame[target])
        predictions = model.predict(test_frame[FEATURES])
        metrics[str(horizon)] = {
            "mae": round(float(mean_absolute_error(test_frame[target], predictions)), 4),
            "rmse": round(float(mean_squared_error(test_frame[target], predictions) ** 0.5), 4),
            "r2": round(float(r2_score(test_frame[target], predictions)), 4),
        }
        if horizon == 1:
            feature_importance = {name: round(float(value), 6) for name, value in zip(FEATURES, model.feature_importances_)}
        joblib.dump(model, MODEL_DIR / f"discharge_{horizon}h.joblib")

    agreement = {
        horizon: round(max(0.0, min(1.0, values["r2"])) * 100, 2)
        for horizon, values in metrics.items()
    }

    metadata = {
        "model": "RandomForestRegressor",
        "modelVersion": MODEL_VERSION,
        "trainingDate": datetime.now(timezone.utc).isoformat(),
        "features": FEATURES,
        "targets": [f"future_discharge_{h}h" for h in HORIZONS],
        "trainingDataset": "backend/ml/data/demo_discharge.csv",
        "datasetStatus": "SYNTHETIC_DEMO_NOT_HISTORICAL",
        "records": int(len(data)),
        "dateRange": {"start": data.timestamp.min().isoformat(), "end": data.timestamp.max().isoformat()},
        "split": {"train": len(train_frame), "validation": len(validation_frame), "test": len(test_frame), "method": "chronological"},
        "metrics": metrics,
        "testAgreementPercent": agreement,
        "metricWarning": "Agreement percentage is R-squared multiplied by 100 on the chronological unseen test split; it is not classification accuracy or probability of truth.",
        "evaluationType": "SYNTHETIC_OFFLINE_BENCHMARK_NOT_REAL_TIME_ACCURACY",
        "featureImportance": feature_importance,
        "severityModel": None,
        "dataSources": ["Seven-year deterministic synthetic fixture anchored to the public Machchhu-II 1979 peak-flow benchmark"],
        "historicalCoverageYears": round((data.timestamp.max() - data.timestamp.min()).total_seconds() / (365.25 * 86400), 3),
        "requiredCoverageYears": 5,
        "provenance": "Seven-year deterministic synthetic research fixture anchored to the public Machchhu-II 1979 peak-flow benchmark; not measured gauge observations.",
    }
    MODEL_DIR.joinpath("model_metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    return metadata


if __name__ == "__main__":
    try:
        print(json.dumps(train()))
    except Exception as error:
        print(json.dumps({"error": str(error)}))
        sys.exit(1)
