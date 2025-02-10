import os
import pandas as pd
import numpy as np
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping

# Define the directories for each category
categories = ['buisness', 'entertainment', 'Politics', 'Sport', 'tech']
image_dir = 'images'

# Prepare image data
image_data = []
labels = []

for idx, category in enumerate(categories):
    category_dir = os.path.join(image_dir, category)
    for img_name in os.listdir(category_dir):
        if img_name.endswith('.jpg'):
            image_data.append(os.path.join(category_dir, img_name))
            labels.append(category)

# Create a DataFrame with the image paths and labels
df = pd.DataFrame({'image': image_data, 'label': labels})

# Convert the labels to categorical (strings instead of numbers)
df['label'] = df['label'].map({
    'buisness': 'buisness',
    'entertainment': 'entertainment',
    'Politics': 'Politics',
    'Sport': 'Sport',
    'tech': 'tech'
})

# Set up ImageDataGenerator for data augmentation and rescaling
train_datagen = ImageDataGenerator(
    rescale=1./255,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True
)

# Prepare the training data from the dataframe
train_generator = train_datagen.flow_from_dataframe(
    dataframe=df,
    x_col='image',
    y_col='label',
    target_size=(224, 224),
    batch_size=32,
    class_mode='sparse'  # Using sparse because labels are now strings
)

# Load a pre-trained ResNet50 model and add custom layers for classification
base_model = ResNet50(weights='imagenet', include_top=False)
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(1024, activation='relu')(x)
x = Dense(len(categories), activation='softmax')(x)

# Create the final model
model = Model(inputs=base_model.input, outputs=x)

# Freeze the layers of the base model for transfer learning
for layer in base_model.layers:
    layer.trainable = False

# Compile the model
model.compile(optimizer=Adam(), loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Set up early stopping to prevent overfitting
early_stopping = EarlyStopping(monitor='val_loss', patience=3)

# Train the model
model.fit(
    train_generator,
    epochs=25,
    callbacks=[early_stopping]
)

# Save the trained model
model.save('../models/image_classification_model.h5')
