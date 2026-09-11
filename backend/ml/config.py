"""Single source of truth for the existing local ML pipeline."""
from pathlib import Path

ROOT = Path(__file__).parent
DATA_PATH = ROOT / "data" / "demo_discharge.csv"
MODEL_DIR = ROOT / "models"
MODEL_VERSION = "demo-v1"
MINIMUM_RECORDS = 30
TEST_FRACTION = 0.15
VALIDATION_FRACTION = 0.15
