from __future__ import annotations

import json
import sys

from model_service import predict


if __name__ == "__main__":
    try:
        payload = json.loads(sys.stdin.read() or "{}")
        print(json.dumps(predict(payload)))
    except Exception as error:
        print(json.dumps({"error": str(error)}))
        sys.exit(1)
