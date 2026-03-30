from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

# 🔹 Load model once (important for performance)
model = SentenceTransformer('all-MiniLM-L6-v2')


# 🔹 Define input structure (THIS FIXES SWAGGER JSON ISSUE)
class Product(BaseModel):
    id: str
    product_name: str
    description: str
    category: str
    subcategory: str
    key_ingredients: str


# 🔹 Helper: combine text for embeddings
def combine_text(product):
    return f"{product.product_name} {product.description} {product.category} {product.subcategory} {product.key_ingredients}"


# 🔹 Root endpoint (optional)
@app.get("/")
def root():
    return {"message": "AI Duplicate Detection API is running"}


# 🔹 Duplicate detection API
@app.post("/detect-duplicates")
def detect_duplicates(products: List[Product]):

    # Convert input to DataFrame
    df = pd.DataFrame([p.dict() for p in products])

    # Combine text
    df["combined"] = df.apply(
        lambda row: f"{row['product_name']} {row['description']} {row['category']} {row['subcategory']} {row['key_ingredients']}",
        axis=1
    )

    # Generate embeddings
    embeddings = model.encode(df["combined"].tolist())

    # Compute similarity
    sim_matrix = cosine_similarity(embeddings)

    threshold = 0.85
    results = []

    # Find duplicate pairs
    for i in range(len(sim_matrix)):
        for j in range(i + 1, len(sim_matrix)):
            score = sim_matrix[i][j]
            if score > threshold:
                results.append({
                    "product_1": df.iloc[i]["id"],
                    "product_2": df.iloc[j]["id"],
                    "confidence": round(float(score), 3)
                })

    return {"duplicates": results}