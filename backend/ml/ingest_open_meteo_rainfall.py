from __future__ import annotations

import csv
import json
from datetime import date, timedelta
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

OUT = Path(__file__).parent / "data" / "machchhu_open_meteo_rainfall_5y.csv"
LATITUDE = 22.7562
LONGITUDE = 70.8988
START = date.today() - timedelta(days=365 * 5)
END = date.today() - timedelta(days=2)


def main() -> None:
    params = urlencode({
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "start_date": START.isoformat(),
        "end_date": END.isoformat(),
        "hourly": "precipitation,soil_moisture_0_to_7cm",
        "timezone": "UTC",
    })
    request = Request(
        f"https://archive-api.open-meteo.com/v1/archive?{params}",
        headers={"User-Agent": "FloodShield-ML-Research/1.0"},
    )
    with urlopen(request, timeout=60) as response:
        payload = json.load(response)
    hourly = payload.get("hourly", {})
    timestamps = hourly.get("time", [])
    rainfall = hourly.get("precipitation", [])
    soil = hourly.get("soil_moisture_0_to_7cm", [])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["timestamp", "rainfall_mm", "soil_moisture", "latitude", "longitude", "source", "data_status"])
        writer.writeheader()
        for index, timestamp in enumerate(timestamps):
            writer.writerow({
                "timestamp": timestamp,
                "rainfall_mm": rainfall[index] if index < len(rainfall) else "",
                "soil_moisture": soil[index] if index < len(soil) else "",
                "latitude": LATITUDE,
                "longitude": LONGITUDE,
                "source": "Open-Meteo Historical Weather API / ERA5-Land derived archive",
                "data_status": "OBSERVED_ARCHIVE_WEATHER_NOT_DISCHARGE",
            })
    print(json.dumps({"output": str(OUT), "records": len(timestamps), "start": START.isoformat(), "end": END.isoformat(), "source": "Open-Meteo archive rainfall and soil moisture"}))


if __name__ == "__main__":
    main()
