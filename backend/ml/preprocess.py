from __future__ import annotations

import pandas as pd

from features import FEATURES, HORIZONS


def load_and_clean(path: str) -> pd.DataFrame:
    """Load local observations, enforce numeric features, and preserve time order."""
    data = pd.read_csv(path, parse_dates=["timestamp"])
    data = data.drop_duplicates(subset=["timestamp"]).sort_values("timestamp").reset_index(drop=True)
    numeric_columns = FEATURES + [f"target_discharge_{h}h" for h in HORIZONS]
    data[numeric_columns] = data[numeric_columns].apply(pd.to_numeric, errors="coerce")
    return data.dropna(subset=numeric_columns).reset_index(drop=True)


def chronological_split(data: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    train_end = int(len(data) * 0.70)
    validation_end = int(len(data) * 0.85)
    return data.iloc[:train_end], data.iloc[train_end:validation_end], data.iloc[validation_end:]
