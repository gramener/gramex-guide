import os
from gramex import cache
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.stem.porter import PorterStemmer

file_path = os.path.join(os.path.dirname(__file__), 'speech.csv')
stemmer = PorterStemmer()
vectorizer = TfidfVectorizer(stop_words='english')


def suggestion(handler):
    '''first 3 questions as suggestion'''
    return cache.open(file_path).sample(5)['Question'].to_json(orient='values')


def get_answer(handler):
    '''getting answer '''
    text = handler.get_arg('q', '')
    df = cache.open(file_path)
    tfidf = vectorizer.fit_transform(stem(s) for s in [text] + df['Question'].values.tolist())
    similarity = cosine_similarity(tfidf[0:1], tfidf[1:])[0]
    top_index = similarity.argmax()
    return {
        'similarity': similarity[top_index],
        'question': df['Question'][top_index],
        'answer': df['Answer'][top_index]
    }


def stem(sentence):
    return ' '.join(stemmer.stem(word) for word in sentence.split())
