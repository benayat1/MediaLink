from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from datasets import Dataset
import pandas as pd

# Load dataset
df = pd.read_csv("translated_file_offline_fixed.csv")  # Replace with the correct path
df = df[['content', 'category']]  # Use relevant columns
df['label'] = df['category'].astype('category').cat.codes  # Encode labels

# Define tokenizer and tokenize dataset
model_name = "onlplab/alephbert-base"  # HebrewBERT model
tokenizer = AutoTokenizer.from_pretrained(model_name)

def tokenize_function(example):
    return tokenizer(example["content"], padding="max_length", truncation=True)

dataset = Dataset.from_pandas(df)
tokenized_dataset = dataset.map(tokenize_function, batched=True)

# Split dataset
train_dataset = tokenized_dataset.shuffle(seed=42).select(range(800))  # Adjust range
test_dataset = tokenized_dataset.shuffle(seed=42).select(range(800, 1000))  # Adjust range

# Load model
NUM_CLASSES = len(set(df['label']))
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=NUM_CLASSES)

# Define training arguments
training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",
    save_strategy="epoch",
    num_train_epochs=3,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    logging_dir="./logs",
    logging_steps=100,
    learning_rate=2e-5,
    load_best_model_at_end=True,
    report_to="none",  # No reporting to WandB
)

# Define trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
)

# Train and evaluate HebrewBERT
trainer.train()
metrics = trainer.evaluate()
print("Results for HebrewBERT:")
print(metrics)
# Save the trained model and tokenizer
model.save_pretrained("./saved_model")
tokenizer.save_pretrained("./saved_model")
print("Model and tokenizer saved to './saved_model'")
