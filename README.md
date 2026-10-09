# Threadly Atelier — AI Stylist & Fashion Boutique Agent

An autonomous AI shopping assistant and personal stylist built with **LangChain v1 (`create_agent`)**, powered by free models on **Groq** (`openai/gpt-oss-120b` with automatic failover to `openai/gpt-oss-20b` and `qwen/qwen3.8-27b`), backed by a deterministic synthetic clothes boutique catalog (~266 items, 1,566 size variants in SQLite), local vector search (FastEmbed + Chroma), and a luxury dark-mode React (Vite) storefront.

---

## Quick Start (Run the App)

### 1. Set your Groq API Key
Obtain a free API key at [console.groq.com/keys](https://console.groq.com/keys) and place it in `backend/.env`:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and set:
# GROQ_API_KEY=gsk_...
```

### 2. Run Everything in One Command
From the project root:
```bash
./dev.sh
```
`./dev.sh` automatically seeds the database, verifies static product images, and launches both the backend and frontend:
- **Storefront & Stylist UI**: [http://localhost:5173](http://localhost:5173)
- **FastAPI OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Running Services Manually

### Backend only
```bash
cd backend
# 1. Seed catalog (run once or to reset)
uv run python -m app.db.seed --reset

# 2. Start server
uv run uvicorn app.main:app --port 8000 --reload
```

### Frontend only
```bash
cd frontend
npm run dev
```

---

## Agent Architecture & Capabilities

1. **Autonomous Tool Selection & Execution**
   - `search_products`: Parametric SQL queries over categories, sizes, colors, styles, fits, materials, brands, price, and in-stock filters. Provides relaxation hints if a search is overly constrained.
   - `semantic_search`: Vector similarity search via local FastEmbed embeddings (`bge-small-en-v1.5`) in Chroma for descriptive and vibe-based queries ("warm outfit for a rainy afternoon").
   - `get_product_details`: Retrieves full product sheets and stock per size.
   - `compare_products`: Side-by-side attribute comparison matrix highlighting best-value and top-rated garments.
   - `complete_the_outfit`: Styling engine coordinating complementary categories, matching palettes, and outfit budget ceilings.
   - `size_advisor`: Deterministic sizing charts converting height, weight, and fit preference into size recommendations.
   - `add_to_cart` / `view_cart` / `remove_from_cart`: Direct bag management reflected live in the UI.
   - `save_user_preferences`: Writes lasting preferences to the long-term store.

2. **Grounding & Zero Hallucinations**
   The agent references products exclusively using `[[P0123]]` citations. The backend validates cited IDs against SQLite and pushes rich cards to the UI. Unknown IDs are ignored.

3. **Memory Layers**
   - **Short-Term Memory**: Conversation history tracked per thread via `AsyncSqliteSaver`.
   - **Long-Term Memory**: Persistent customer tastes (sizes, preferred colors, styles, dislikes) stored via `AsyncSqliteStore` and dynamically injected into system prompts via `@dynamic_prompt`.
   - **Context Window Management**: `SummarizationMiddleware` automatically condenses conversations when token triggers are reached.

4. **Resilience & Guardrails**
   - **Model Fallback**: If Groq's primary model hits a rate limit or error, `ModelFallbackMiddleware` seamlessly transitions to the backup models without breaking the session.
   - **Prompt Guard**: `PromptGuardMiddleware` blocks prompt injection attempts and keeps the conversation focused on fashion and styling.
