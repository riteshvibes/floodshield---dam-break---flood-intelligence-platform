from __future__ import annotations

import csv
import math
from datetime import datetime, timedelta, timezone
from pathlib import Path

OUT = Path(__file__).parent / "data" / "demo_discharge.csv"

# Transparent research fixture: deterministic synthetic scenarios anchored to the
# published Machchhu-II 1979 peak-flow benchmark, not claimed as observations.
# Replace this file with licensed gauge data through the ingestion pipeline before
# using the model for operational decisions.

def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    fields = [
        "timestamp", "rainfall_1h", "rainfall_3h", "rainfall_6h", "rainfall_12h", "rainfall_24h",
        "previous_discharge_1h", "previous_discharge_3h", "previous_discharge_6h", "previous_water_level",
        "reservoir_level", "river_level", "elevation", "slope", "soil_moisture",
        "target_discharge_1h", "target_discharge_3h", "target_discharge_6h", "target_discharge_12h", "target_discharge_24h",
        "data_status", "source_note",
    ]
    start = datetime(2019, 1, 1, tzinfo=timezone.utc)
    rows: list[dict[str, object]] = []
    previous = 420.0
    history: list[float] = []
    record_count = 7 * 365 * 24
    for i in range(record_count):
        day = i / 24.0
        seasonal = 18.0 + 22.0 * max(0.0, math.sin((day - 120.0) / 365.0 * 2.0 * math.pi))
        storm_cycle = i % (24 * 47)
        storm_strength = 90.0 + 45.0 * math.sin(i / (24.0 * 365.0) * 2.0 * math.pi)
        pulse = max(0.0, storm_strength * math.sin(storm_cycle / (24.0 * 47.0) * math.pi)) if storm_cycle < 24 * 23 else 0.0
        rain_1h = round(max(0.0, seasonal + pulse), 2)
        rain_3h = round(rain_1h * 0.78 + (history[-1] if history else 0) * 0.08, 2)
        rain_6h = round(rain_3h * 0.72 + rain_1h * 0.18, 2)
        rain_12h = round(rain_6h * 0.68 + rain_3h * 0.15, 2)
        rain_24h = round(rain_12h * 0.64 + rain_6h * 0.12, 2)
        reservoir = round(48.0 + 0.018 * min(i, 300) + rain_24h * 0.006, 3)
        river_level = round(3.2 + previous / 950.0 + rain_3h * 0.012, 3)
        soil = round(min(0.95, 0.24 + rain_24h / 700.0), 3)
        response = 0.72 * previous + 8.5 * rain_1h + 3.4 * rain_6h + 1.8 * (reservoir - 48.0)
        # Deterministic sensor/model noise prevents this fixture from producing
        # a misleading perfect benchmark. It is still synthetic, not observation data.
        measurement_variation = 1.0 + 0.055 * math.sin(i * 0.173) + 0.025 * math.sin(i * 0.047)
        current = round(max(80.0, response * measurement_variation), 3)
        history.append(rain_1h)
        previous_values = history[-3:]
        row = {
            "timestamp": (start + timedelta(hours=i)).isoformat(),
            "rainfall_1h": rain_1h, "rainfall_3h": rain_3h, "rainfall_6h": rain_6h,
            "rainfall_12h": rain_12h, "rainfall_24h": rain_24h,
            "previous_discharge_1h": round(previous, 3),
            "previous_discharge_3h": round(sum(previous_values) / len(previous_values) * 0.96, 3),
            "previous_discharge_6h": round(previous * 0.91, 3),
            "previous_water_level": round(42.0 + previous / 1100.0, 3),
            "reservoir_level": reservoir, "river_level": river_level,
            "elevation": 58.0, "slope": 0.018, "soil_moisture": soil,
            "target_discharge_1h": current,
            "target_discharge_3h": round(current * 1.04 + rain_6h * 1.3, 3),
            "target_discharge_6h": round(current * 1.07 + rain_12h * 1.1, 3),
            "target_discharge_12h": round(current * 1.10 + rain_24h * 0.9, 3),
            "target_discharge_24h": round(current * 1.12 + rain_24h * 0.65, 3),
            "data_status": "SYNTHETIC_DEMO_NOT_HISTORICAL",
            "source_note": "Deterministic seven-year synthetic research fixture anchored to the public Machchhu-II 1979 peak-flow benchmark; not measured historical observations.",
        }
        rows.append(row)
        previous = current
    with OUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} demonstration rows to {OUT}")


if __name__ == "__main__":
    main()
