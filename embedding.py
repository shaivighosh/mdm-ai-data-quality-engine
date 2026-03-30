import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load data
df = pd.read_excel("beauty_products_dataset.xlsx")

# Combine text fields (VERY IMPORTANT)
def combine_text(row):
    return f"{row['product_name']} {row['description']} {row['category']} {row['subcategory']} {row['key_ingredients']}"

df["combined"] = df.apply(combine_text, axis=1)

# Load embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Generate embeddings
embeddings = model.encode(df["combined"].tolist())

# Similarity matrix
sim_matrix = cosine_similarity(embeddings)

# Detect duplicates
threshold = 0.85
pairs = []

for i in range(len(sim_matrix)):
    for j in range(i+1, len(sim_matrix)):
        score = sim_matrix[i][j]
        if score > threshold:
            pairs.append({
                "product_1": df.iloc[i]["id"],
                "product_2": df.iloc[j]["id"],
                "confidence": round(score, 3)
            })

duplicates_df = pd.DataFrame(pairs)

# Save output
duplicates_df.to_csv("duplicate_pairs.csv", index=False)

print("Done! Check duplicate_pairs.csv")