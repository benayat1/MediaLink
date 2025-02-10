from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F  # עבור חישוב softmax
import speech_recognition as sr


MODEL_PATH = "../models/saved_model"  

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)

LABEL_MAP = {
    0: "עסקים",
    1: "בידור",
    2: "פוליטיקה",
    3: "ספורט",
    4: "טכנולוגיה",
    5: "מדע"
}  

def classify_text(text):
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    
    # תחזית המודל
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probabilities = F.softmax(logits, dim=1)  # המרת logits להסתברויות
        predicted_class = torch.argmax(probabilities, dim=1).item()  # מציאת התווית הצפויה
        confidence = probabilities[0, predicted_class].item()  # ההסתברות של התווית הצפויה
    
    return predicted_class, confidence

    
# פונקציה עיקרית
def main():
    print("Welcome to the catalog system")
    text = ""
    while True:
        choice = input("Choose: 1. Enter text | 2. Upload audio file | 3. Exit: ")
        if choice == "3":
            print("Goodbye!")
            break
        elif choice == "1":
            text = input("Enter text for analysis: ")

        predicted_class, confidence = classify_text(text)
        category_name = LABEL_MAP.get(predicted_class, "Unknown")
        print(f"The predicted category is: {category_name} (Confidence: {confidence * 100:.2f}%)")


# הרצת הפונקציה הראשית
if __name__ == "__main__":
    main()
