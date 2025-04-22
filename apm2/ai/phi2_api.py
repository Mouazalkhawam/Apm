from flask import Flask, request, jsonify
import requests
import logging
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# إعداد الترميز
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# اكتب مفتاح ApyHub API الخاص بك هنا
APYHUB_API_KEY = "APY0xBLn0dLVFSVfHhyklWJFJem8NEBShMxZZb88HIHATnIxFimaqNRZj9PjTsHzDGB3yDL"

app = Flask(__name__)

def run_apyhub(prompt):
    url = "https://api.apyhub.com/ai/summarize-text"
    headers = {
        "Content-Type": "application/json",
        "apy-token": APYHUB_API_KEY
    }
    payload = {
        "text": prompt,
        "summary_length": "short",  # يمكنك تعديل هذا بناءً على احتياجاتك
        "output_language": "en"  # يمكنك تعديل هذا بناءً على احتياجاتك
    }
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json().get("summary", "")
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ خطأ أثناء الاتصال بـ ApyHub: {str(e)}")
        return "خطأ أثناء الاتصال بـ ApyHub"

@app.route('/summarize', methods=['POST'])
def summarize():
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        lang = data.get('lang', 'ar')

        if not text:
            return jsonify({"error": "نص التلخيص فارغ"}), 400

        summary = run_apyhub(text)

        return jsonify({
            "summary": summary,
            "original_length": len(text),
            "summary_length": len(summary)
        })

    except Exception as e:
        logger.error(f"❌ خطأ في التلخيص: {str(e)}")
        return jsonify({"error": "خطأ في الخادم", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
