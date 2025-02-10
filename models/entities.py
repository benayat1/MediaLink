from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline

def merge_adjacent_entities(entities):
    """
    Merges adjacent entities of the same type based on start (B-*), continuation (I-*), and end (E-*) labels.
    """
    merged_entities = []
    current_entity = None

    for entity in entities:
        entity_type = entity["entity"].split("-")[-1]  # Entity type (e.g., PER, ORG, etc.)
        tag = entity["entity"].split("-")[0]  # Tag (B, I, E, S)

        if tag == "B":  # Beginning of a new entity
            if current_entity:
                merged_entities.append(current_entity)
            current_entity = {
                "word": entity["word"],
                "entity_type": entity_type,
                "start": entity["start"],
                "end": entity["end"],
                "score": entity["score"]
            }
        elif tag in ["I", "E"] and current_entity and current_entity["entity_type"] == entity_type:
            # Continuation or end of the same entity
            current_entity["word"] += f" {entity['word']}"
            current_entity["end"] = entity["end"]
            current_entity["score"] = max(current_entity["score"], entity["score"])
            if tag == "E":
                merged_entities.append(current_entity)
                current_entity = None
        elif tag == "S":  # Singleton entity
            if current_entity:
                merged_entities.append(current_entity)
            current_entity = {
                "word": entity["word"],
                "entity_type": entity_type,
                "start": entity["start"],
                "end": entity["end"],
                "score": entity["score"]
            }
            merged_entities.append(current_entity)
            current_entity = None

    if current_entity:
        merged_entities.append(current_entity)

    return merged_entities

def extract_entities(conversation):
    """
    Extracts unique entities from the conversation and returns a list of dictionaries with detailed information.
    """
    model_name = "msperka/aleph_bert_gimmel-finetuned-ner"

    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForTokenClassification.from_pretrained(model_name)
    nlp = pipeline("ner", model=model, tokenizer=tokenizer, grouped_entities=False)

    sentences = conversation.split(". ")
    all_entities = []

    for sentence in sentences:
        entities = nlp(sentence)
        merged_entities = merge_adjacent_entities(entities)
        all_entities.extend(merged_entities)

    # Remove duplicates by using a dictionary keyed by the word
    unique_entities = {}
    for entity in all_entities:
        word = entity["word"]
        if word not in unique_entities:
            unique_entities[word] = entity
        else:
            # Merge scores for duplicates
            unique_entities[word]["score"] = max(unique_entities[word]["score"], entity["score"])

    return list(unique_entities.values())


if __name__ == '__main__':
    conversation = """`
    מיה: היי אדם, מה קורה?
    אדם: היי מיה, הכול טוב. מה איתך?
    מיה: סבבה, תודה. תגיד, ראית את יונתן היום?
    """
    entities = extract_entities(conversation)
    for entity in entities:
        print(entity)
