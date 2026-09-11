from __future__ import annotations

from typing import Any

FEATURES = [
    "rainfall_1h",
    "rainfall_3h",
    "rainfall_6h",
    "rainfall_12h",
    "rainfall_24h",
    "previous_discharge_1h",
    "previous_discharge_3h",
    "previous_discharge_6h",
    "previous_water_level",
    "reservoir_level",
    "river_level",
    "elevation",
    "slope",
    "soil_moisture",
]
HORIZONS = [1, 3, 6, 12, 24]


def clean_input(payload: dict[str, Any]) -> dict[str, float]:
    defaults = {
        "rainfall_1h": 0.0,
        "rainfall_3h": 0.0,
        "rainfall_6h": 0.0,
        "rainfall_12h": 0.0,
        "rainfall_24h": 0.0,
        "previous_discharge_1h": 500.0,
        "previous_discharge_3h": 500.0,
        "previous_discharge_6h": 500.0,
        "previous_water_level": 45.0,
        "reservoir_level": 50.0,
        "river_level": 5.0,
        "elevation": 100.0,
        "slope": 0.02,
        "soil_moisture": 0.35,
    }
    values: dict[str, float] = {}
    for name in FEATURES:
        value = payload.get(name, defaults[name])
        try:
            values[name] = float(value)
        except (TypeError, ValueError):
            values[name] = defaults[name]
    return values
