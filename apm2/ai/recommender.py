# الخلية 1: استيراد المكتبات
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from flask import Flask, request, jsonify
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import string
import os

# تحميل موارد NLTK


# الخلية 2: معالجة النصوص
def preprocess_text(text):
    """تنظيف ومعالجة النص"""
    if not text or pd.isna(text):
        return ''
    
    text = text.lower()
    tokens = nltk.word_tokenize(text)
    tokens = [word for word in tokens if word not in string.punctuation]
    stop_words = set(stopwords.words('english'))
    tokens = [word for word in tokens if word not in stop_words]
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(word) for word in tokens]
    return ' '.join(tokens)

# الخلية 4: نظام التوصية
class ProjectPartnerRecommender:
    def __init__(self, df):
        self.df = df.copy()
        self.prepare_data()
        self.train_model()

    def prepare_data(self):
        """تحضير البيانات للتحليل"""
        self.df['processed_skills'] = self.df['skills'].fillna('').apply(preprocess_text)
        self.df['processed_exp'] = self.df['experience'].fillna('').apply(preprocess_text)
        self.df['gpa'] = self.df['gpa'].fillna(0.0)
        self.df['combined_text'] = self.df['processed_skills'] + ' ' + self.df['processed_exp']

    def train_model(self):
        """بناء نموذج TF-IDF"""
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 2),
            stop_words='english'
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['combined_text'])

    def recommend_partners(self, search_query=None, top_n=10):
        """إنتاج التوصيات بناءً على البحث"""
        results = self.df.copy()

        if search_query:
            processed_query = preprocess_text(search_query)
            query_vector = self.vectorizer.transform([processed_query])
            sim_scores = cosine_similarity(query_vector, self.vectorizer.transform(results['combined_text'])).flatten()
            results['match_score'] = sim_scores
        else:
            results['match_score'] = 1.0  # كلهم متساويين إذا ما في استعلام

        # الترتيب حسب: تطابق البحث ثم GPA
        results = results.sort_values(by=['match_score', 'gpa'], ascending=[False, False])

        return results.head(top_n)[['student_id', 'name', 'skills', 'experience', 'gpa']]

# الخلية 4: Flask API
app = Flask(__name__)

@app.route('/recommend', methods=['POST'])
def handle_recommendation():
    """نقطة النهاية لطلبات التوصية"""
    try:
        data = request.get_json()
        students = pd.DataFrame(data['students'])
        search_query = data.get('query')
        
        recommender = ProjectPartnerRecommender(students)
        recommendations = recommender.recommend_partners(
            search_query=search_query,
            top_n=data.get('top_n', 10)
        )
        return jsonify({
            'status': 'success',
            'data': recommendations.to_dict(orient='records')
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'خطأ في المعالجة: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
