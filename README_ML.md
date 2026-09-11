# FloodShield local ML pipeline

This repository did not contain licensed historical gauge time series, so the checked-in model is explicitly a `DEMO_MODEL`. `backend/ml/create_demo_dataset.py` creates a deterministic demonstration fixture anchored to the public Machchhu-II 1979 peak-flow benchmark. Its rows are not claimed as measured historical observations and must be replaced with licensed gauge data before operational use.

## Setup

```powershell
python -m pip install -r backend/ml/requirements.txt
python backend/ml/create_demo_dataset.py
python backend/ml/train.py
```

The training script performs chronological train/validation/test splits, saves one local model per forecast horizon, and writes `backend/ml/models/model_metadata.json`. No external API is used during prediction.

The Express service exposes `POST /api/ml/predict`, `POST /api/ml/predict-simulate`, `POST /api/ml/train`, and `GET /api/ml/status`. The coupled endpoint passes the local model's predicted discharge into the existing TypeScript hydrodynamic engine.
