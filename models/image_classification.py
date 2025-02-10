import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array

# 2. עיבוד מקדים לתמונה
def preprocess_image(image_path, target_size=(224, 224)):
    img = load_img(image_path, target_size=target_size)  # שינוי גודל
    img_array = img_to_array(img)  # המרה למערך
    img_array = np.expand_dims(img_array, axis=0)  # הוספת מימד אצווה
    img_array = img_array / 255.0  # נירמול לערכים בין 0 ל-1
    return img_array

# 3. סיווג התמונה
def classify_image(image_path):
    # נתיב למודל
    model_path = '../models/image_classification_model.h5'
    # טעינת המודל
    model = load_model(model_path)
    # שמות הקטגוריות (התאמה לסדר שבו המודל אומן)
    class_names = ['Politics', 'Sport', 'Entertainment', 'Business', 'Tech']

    # עיבוד התמונה
    processed_image = preprocess_image(image_path)
    # חיזוי באמצעות המודל
    predictions = model.predict(processed_image)
    # זיהוי הקטגוריה המובילה
    predicted_class = class_names[np.argmax(predictions)]
    
    return predicted_class
