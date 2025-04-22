import requests

# عنوان الـ API المحلي (Flask)
API_URL = "http://127.0.0.1:5000/summarize"

# المستخدم يلصق النص هنا
text = input("✍️ تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي  ‏ه:\n\n")

response = requests.post(API_URL, json={"text": text, "lang": "ar"})

if response.status_code == 200:
    summary = response.json()["summary"]
    print("\n✅ التلخيص:\n", summary)
else:
    print("\n❌ حدث خطأ:")
    print(response.json())
