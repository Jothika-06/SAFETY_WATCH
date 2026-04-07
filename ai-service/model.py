def predict_complaint(text):
    text = text.lower()

    # Electrical
    if "light" in text or "electric" in text or "power" in text or "pole" in text:
        return {
            "category": "Electrical",
            "severity": "Medium",
            "confidence_score": 0.85
        }

    # Water
    elif "water" in text or "pipe" in text or "leak" in text or "tap" in text:
        return {
            "category": "Water",
            "severity": "High",
            "confidence_score": 0.90
        }

    # Road
    elif "road" in text or "pothole" in text or "street" in text:
        return {
            "category": "Road",
            "severity": "Medium",
            "confidence_score": 0.80
        }

    # Garbage
    elif "garbage" in text or "waste" in text or "trash" in text:
        return {
            "category": "Garbage",
            "severity": "Low",
            "confidence_score": 0.75
        }

    # Drainage
    elif "drain" in text or "sewage" in text or "overflow" in text:
        return {
            "category": "Drainage",
            "severity": "High",
            "confidence_score": 0.88
        }

    # Emergency
    elif "fire" in text or "accident" in text:
        return {
            "category": "Emergency",
            "severity": "High",
            "confidence_score": 0.95
        }

    # Default
    return {
        "category": "Other",
        "severity": "Low",
        "confidence_score": 0.50
    }