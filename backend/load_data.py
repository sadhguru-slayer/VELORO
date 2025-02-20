import json
from django.apps import apps

# Load JSON file
with open("all_data.json", "r", encoding="utf-8") as file:
    data = json.load(file)

# Process only `core.category` entries
for entry in data:
    if entry["model"] != "core.skill":
        continue  # Skip other models

    app_label, model_name = entry["model"].split(".")  # Extract app name and model name

    try:
        model = apps.get_model(app_label, model_name)  # Dynamically get the model
    except LookupError:
        print(f"Model '{model_name}' not found in app '{app_label}', skipping...")
        continue

    pk = entry["pk"]
    fields = entry["fields"]

    # Skip existing records
    if model.objects.filter(pk=pk).exists():
        print(f"Skipping existing Category (PK: {pk})")
        continue

    try:
        model.objects.create(pk=pk, **fields)
        print(f"Inserted Category (PK: {pk}) into {model_name}")
    except Exception as e:
        print(f"Error inserting {model_name} (PK: {pk}): {e}")

print("✅ Category data insertion completed.")
