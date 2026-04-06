import re
import numpy as np
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

nltk.download("stopwords", quiet=True)
from nltk.corpus import stopwords

# ── Training Data ─────────────────────────────────────
TRAINING_DATA = [
    # Electrical
    ("street light not working",            "Electrical",   "Medium"),
    ("electric pole is broken",             "Electrical",   "High"),
    ("power outage in our area",            "Electrical",   "High"),
    ("street lamp is damaged",              "Electrical",   "Medium"),
    ("electricity supply is cut off",       "Electrical",   "High"),
    ("light not working near park",         "Electrical",   "Low"),
    ("electric wire hanging dangerously",   "Electrical",   "High"),
    ("transformer is making noise",         "Electrical",   "Medium"),
    ("power fluctuation in street",         "Electrical",   "Medium"),
    ("no electricity since two days",       "Electrical",   "High"),
    # Roads
    ("large pothole on main road",          "Roads",        "High"),
    ("road is damaged near school",         "Roads",        "High"),
    ("road crack causing accidents",        "Roads",        "High"),
    ("broken road near bus stop",           "Roads",        "Medium"),
    ("speed breaker is broken",             "Roads",        "Medium"),
    ("road full of potholes",               "Roads",        "High"),
    ("road maintenance needed urgently",    "Roads",        "High"),
    ("footpath is broken",                  "Roads",        "Low"),
    ("road divider is damaged",             "Roads",        "Medium"),
    ("potholes causing vehicle damage",     "Roads",        "High"),
    # Sanitation
    ("garbage overflow near market",        "Sanitation",   "High"),
    ("garbage not collected for days",      "Sanitation",   "Medium"),
    ("garbage bin is full overflowing",     "Sanitation",   "High"),
    ("waste dumped on road",                "Sanitation",   "Medium"),
    ("bad smell from garbage area",         "Sanitation",   "Medium"),
    ("drainage is blocked",                 "Sanitation",   "High"),
    ("open drain causing smell",            "Sanitation",   "Medium"),
    ("sewage water on road",                "Sanitation",   "High"),
    ("no garbage collection in street",     "Sanitation",   "Medium"),
    ("public toilet is very dirty",         "Sanitation",   "Low"),
    # Water Supply
    ("water pipe is leaking",               "Water Supply", "Medium"),
    ("no water supply since morning",       "Water Supply", "High"),
    ("water leakage on road",               "Water Supply", "Medium"),
    ("pipeline burst near park",            "Water Supply", "High"),
    ("water coming with bad smell",         "Water Supply", "High"),
    ("water supply is irregular",           "Water Supply", "Medium"),
    ("tap water is muddy",                  "Water Supply", "Medium"),
    ("water meter is damaged",              "Water Supply", "Low"),
    ("overhead tank is leaking",            "Water Supply", "Medium"),
    ("no drinking water supply",            "Water Supply", "High"),
    # Emergency
    ("fire accident near warehouse",        "Emergency",    "High"),
    ("building collapse",                   "Emergency",    "High"),
    ("fire in residential area",            "Emergency",    "High"),
    ("accident on highway",                 "Emergency",    "High"),
    ("tree fell on road blocking traffic",  "Emergency",    "High"),
    ("gas leak in apartment",               "Emergency",    "High"),
    ("flood water entering houses",         "Emergency",    "High"),
    ("wall collapsed on road",              "Emergency",    "High"),
    ("vehicle accident near junction",      "Emergency",    "High"),
    ("fire broke out in shop",              "Emergency",    "High"),
]

# ── Preprocessing ─────────────────────────────────────
stop_words = set(stopwords.words("english"))

def preprocess(text):
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    tokens = text.split()
    tokens = [t for t in tokens if t not in stop_words]
    return " ".join(tokens)

# ── Prepare data ──────────────────────────────────────
descriptions = [preprocess(d) for d, c, s in TRAINING_DATA]
categories   = [c for d, c, s in TRAINING_DATA]
severities   = [s for d, c, s in TRAINING_DATA]

# ── Train models ──────────────────────────────────────
category_model = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
    ("nb",    MultinomialNB()),
])
category_model.fit(descriptions, categories)

severity_model = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
    ("nb",    MultinomialNB()),
])
severity_model.fit(descriptions, severities)

# ── Minimum word count for a meaningful complaint ─────
MIN_MEANINGFUL_WORDS = 3

def is_meaningful(text):
    """
    Returns True only if the description has enough real words
    (after stopword removal) to make a valid classification.
    Single words, random characters, or very short junk inputs
    like 'dkk', 'abc', 'test' are rejected.
    """
    cleaned = preprocess(text)
    words = [w for w in cleaned.split() if len(w) >= 3]
    return len(words) >= MIN_MEANINGFUL_WORDS

# ── Predict Function ──────────────────────────────────
def predict_complaint(description):
    """
    Classifies a complaint description.
    Returns low confidence and 'Other' / 'Low' defaults
    if the description is too short or meaningless.
    """
    # Guard: reject junk/very short inputs
    if not description or len(description.strip()) < 10:
        return {
            "category":         "Other",
            "severity":         "Low",
            "confidence_score": 0.0,
        }

    if not is_meaningful(description):
        return {
            "category":         "Other",
            "severity":         "Low",
            "confidence_score": 0.0,
        }

    cleaned    = preprocess(description)
    category   = category_model.predict([cleaned])[0]
    cat_proba  = category_model.predict_proba([cleaned])[0]
    confidence = round(float(np.max(cat_proba)), 2)

    # If model is not confident enough, downgrade severity
    severity = severity_model.predict([cleaned])[0]
    if confidence < 0.3:
        severity = "Low"

    return {
        "category":         category,
        "severity":         severity,
        "confidence_score": confidence,
    }