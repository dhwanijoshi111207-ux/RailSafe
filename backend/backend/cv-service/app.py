
from flask import Flask, request, jsonify
import cv2
import numpy as np
import os

app = Flask(__name__)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "RailSafe CV Service is running"
    })


@app.route("/compare", methods=["POST"])
def compare_images():
    if "before" not in request.files or "after" not in request.files:
        return jsonify({
            "error": "Please upload both before and after photos"
        }), 400

    before_bytes = np.frombuffer(
        request.files["before"].read(), np.uint8
    )
    after_bytes = np.frombuffer(
        request.files["after"].read(), np.uint8
    )

    before = cv2.imdecode(before_bytes, cv2.IMREAD_COLOR)
    after = cv2.imdecode(after_bytes, cv2.IMREAD_COLOR)

    if before is None or after is None:
        return jsonify({
            "error": "Invalid image file"
        }), 400

    after = cv2.resize(
        after,
        (before.shape[1], before.shape[0])
    )

    difference = cv2.absdiff(before, after)
    gray = cv2.cvtColor(difference, cv2.COLOR_BGR2GRAY)

    changed_pixels = cv2.countNonZero(
        cv2.threshold(
            gray, 30, 255, cv2.THRESH_BINARY
        )[1]
    )

    total_pixels = gray.shape[0] * gray.shape[1]
    change_percent = round(
        changed_pixels / total_pixels * 100, 2
    )

    return jsonify({
        "change_percent": change_percent,
        "message": "Photo comparison completed",
        "note": (
            "Visual change only; an officer must verify "
            "whether the repair is successful."
        )
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )
