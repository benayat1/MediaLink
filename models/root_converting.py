from transformers import AutoTokenizer, AutoModel

tokenizer = AutoTokenizer.from_pretrained('dicta-il/dictabert-joint')
model = AutoModel.from_pretrained('dicta-il/dictabert-joint', trust_remote_code=True)
model.eval()  # Ensure we only use the model and not updating it

# Get the root of a word
def get_root(text):
    analysis = model.predict(text, tokenizer, output_style='json')
    return analysis['tokens'][0]['lex']
