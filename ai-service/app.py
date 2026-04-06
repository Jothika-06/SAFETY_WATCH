
import nltk
nltk.download('punkt')
nltk.download('stopwords')
from flask import Flask, request, jsonify
from flask_cors import CORS
from model import predict_complaint

app = Flask(__name__)
CORS(app)

# ── Health Check ──────────────────────────────────────
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "SafetyWatch AI Service is running ✅"})

# ── Analyze Complaint ─────────────────────────────────
@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()

        if not data or "description" not in data:
            return jsonify({"error": "Description is required"}), 400

        description = data["description"]

        # Call prediction function
        result = predict_complaint(description)

        return jsonify({
            "category":         result["category"],
            "severity":         result["severity"],
            "confidence_score": result["confidence_score"]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


