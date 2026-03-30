# mdm-ai-data-quality-engine
AI-powered product data quality engine for MDM. performs enrichment, validation, and semantic duplicate detection using embeddings, integrated with STEP via FastAPI.

## Overview
This project improves product data quality in the STEP MDM system by adding an intelligent AI layer that performs:

-  Marketing description enrichment
- Content validation with scoring
- Semantic product duplicate detection

All capabilities are exposed via a FastAPI service and integrated with Stibo STEP.


## Architecture Flow
STEP → FastAPI → AI Engine → Response → STEP

## Components:
- Stibo STEP MDM: Stores product data and displays results
- FastAPI: Acts as a bridge between STEP and AI logic
- AI Engine (Python): Performs enrichment, validation, and duplicate detection

## Features

### 1️.  Marketing Description Enrichment (Gemini 2.5)
#### Problem: 
Product descriptions are often:
- Missing
- Too short
- Not marketing-friendly

#### Solution:
Use Gemini 2.5 to generate high-quality marketing descriptions.

#### How it works:
Input:
- Product Name + Related Attributes
- Gemini generates Structured, Human-readable, Marketing-focused description

- Output (stored in STEP)
Marketing Description Attribute

### 2. Content Validation with Grading (A–F)
#### Problem:
AI-generated or existing descriptions may:

- Be too generic
- Miss key details
- Contain low-quality or misleading text

#### Solution:
Validate descriptions using:
- Rule-based checks
- AI-based scoring

#### Validation Logic:

The system evaluates:
- Completeness
- Clarity
- Relevance
- Compliance

#### Example Output:
{
  "grade": "B",
  "reason": "Clear and complete description with relevant attributes"
}


### 3️. Semantic Duplicate Detection
#### Problem: 
Same product may exist with different names:

- “Hydrating Face Cream”
- “Face Cream Hydration”

Rule-based matching fails to detect this.

#### Solution: 
Use semantic similarity with embeddings.

#### How it works: 
- Step 1: Combine product data
name + description + category + attributes
- Step 2: Convert to embeddings
  (Text → numerical vectors)

- Step 3: Compute similarity using cosine similarity

- Step 4: Apply threshold
similarity > 0.85 → duplicate

#### Example Output: 
{
  "product_1": "P001",
  "product_2": "P021",
  "confidence": 0.91
}

#### Stored in STEP (Future upgrade)

Data Container:
- Product IDs
- Confidence Score
- Duplicate Group ID

#### FastAPI Integration
- Endpoint: POST /process-products


<img width="1862" height="1003" alt="image" src="https://github.com/user-attachments/assets/369ddaf8-9fc7-480c-8aa7-d324fed48355" />

