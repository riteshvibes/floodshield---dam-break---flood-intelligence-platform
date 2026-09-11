# FloodShield ML flow

`data/` -> `preprocess.py` -> `features.py` / `feature_engineering.py` -> `train.py` -> chronological test evaluation -> `models/` -> `predict.py` -> Express `/api/ml/*` routes.

The current checked-in source is explicitly `SYNTHETIC_DEMO_NOT_HISTORICAL`: it contains a deterministic seven-year synthetic fixture because the original project had no licensed multi-year gauge series. Replace `data/demo_discharge.csv` with a documented, licensed historical dataset before operational claims. The training and evaluation scripts preserve chronological ordering and report actual metrics, but synthetic coverage is not historical evidence.

Real-time accuracy is intentionally reported as unavailable until measured discharge observations are paired with forecasts. The application collects those observations through `/api/ml/live-validation`; use that measured feedback to build the next production training set. Synthetic offline scores must never be described as real-world accuracy.
