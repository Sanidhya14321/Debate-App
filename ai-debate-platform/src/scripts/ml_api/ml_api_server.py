# ml_api/ml_api_server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import traceback

# make sure ml_judge is importable
# run this file from ml_api/ folder or adjust sys.path accordingly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ml_judge import DebateJudge

app = Flask(__name__)
CORS(app)

judge = DebateJudge()
# lazy init - but we can warmup models on start
try:
    judge.init_models()
    print("ML models initialized")
except Exception as e:
    print("Warning: ML models warmup failed at startup:", e)

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json() or {}
        text = data.get("text", "")
        if text is None or text == "":
            return jsonify({"error": "No text provided"}), 400
        scores = judge.score_argument(text)
        return jsonify(scores)
    except Exception as e:
        print("[/analyze] error:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/finalize", methods=["POST"])
def finalize():
    try:
        data = request.get_json() or {}
        arguments = data.get("arguments", [])
        if not arguments:
            return jsonify({"error": "No arguments provided"}), 400

        # group by username
        users = {}
        for arg in arguments:
            user = arg.get("username") or arg.get("userId") or "unknown"
            users.setdefault(user, []).append(arg.get("argumentText") or arg.get("argument", ""))

        user_keys = list(users.keys())
        args_a = users.get(user_keys[0], []) if len(user_keys) >= 1 else []
        args_b = users.get(user_keys[1], []) if len(user_keys) >= 2 else []

        results = judge.evaluate(args_a, args_b)
        return jsonify(results)
    except Exception as e:
        print("[/finalize] error:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    try:
        ok = {"status": "healthy", "models": getattr(judge, "_initialized", False)}
        return jsonify(ok)
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print("Starting ML API server on port", port)
    app.run(host="0.0.0.0", port=port)
