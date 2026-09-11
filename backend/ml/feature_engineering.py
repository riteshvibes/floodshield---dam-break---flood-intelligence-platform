from __future__ import annotations

import pandas as pd


def add_time_features(data: pd.DataFrame) -> pd.DataFrame:
    """Add calendar signals without using future observations."""
    enriched = data.copy()
    enriched["hour"] = enriched["timestamp"].dt.hour
    enriched["day_of_year"] = enriched["timestamp"].dt.dayofyear
    enriched["month"] = enriched["timestamp"].dt.month
    return enriched
