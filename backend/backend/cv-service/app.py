
from flask import Flask, request, jsonify
import cv2
import numpy as np
import os

app = Flask(__name__)

# Maximum upload size: 10 MB
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "RailSafe CV Service is running"
    }), 200


@app.route("/compare", methods=["POST"])
def compare_images():
    try:
        # Check that both photos were uploaded
        if "before" not in request.files or "after" not in request.files:
            return jsonify({
                "error": "Please upload both before and after photos."
            }), 400

        before_file = request.files["before"]
        after_file = request.files["after"]

        if not before_file.filename or not after_file.filename:
            return jsonify({
                "error": "Both image files must have filenames."
            }), 400

        # Read uploaded images
        before_bytes = np.frombuffer(
            before_file.read(), dtype=np.uint8
        )
        after_bytes = np.frombuffer(
            after_file.read(), dtype=np.uint8
        )

        before = cv2.imdecode(
            before_bytes, cv2.IMREAD_COLOR
        )
        after = cv2.imdecode(
            after_bytes, cv2.IMREAD_COLOR
        )

        # Validate images
        if before is None or after is None:
            return jsonify({
                "error": "Invalid image file. Please upload valid photos."
            }), 400

        # Resize after photo to match before photo
        after = cv2.resize(
            after,
            (before.shape[1], before.shape[0])
        )

        # Calculate visual difference
        difference = cv2.absdiff(before, after)
        gray = cv2.cvtColor(
            difference, cv2.COLOR_BGR2GRAY
        )

        _, threshold_image = cv2.threshold(
            gray, 30, 255, cv2.THRESH_BINARY
        )

        changed_pixels = cv2.countNonZero(
            threshold_image
        )

        total_pixels = gray.shape[0] * gray.shape[1]

        change_percent = round(
            (changed_pixels / total_pixels) * 100, 2
        )

        return jsonify({
            "change_percent": change_percent,
            "message": "Photo comparison completed successfully.",
            "note": (
                "This measures visual differences only. "
                "An authorized railway officer must verify "
                "whether the repair was successful."
            )
        }), 200

    except Exception as error:
        app.logger.exception("Photo comparison failed")
        return jsonify({
            "error": "Photo comparison failed. Please try again."
        }), 500


@app.errorhandler(413)
def file_too_large(error):
    return jsonify({
        "error": "Photo is too large. Maximum upload size is 10 MB."
    }), 413


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )

