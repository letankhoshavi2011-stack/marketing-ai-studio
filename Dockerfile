# ──────────────────────────────────────────────────────────────────────
# Stage 1: Build the Frontend (Vite/React)
# ──────────────────────────────────────────────────────────────────────
FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ .
# Build the production assets into /app/dist
RUN npm run build

# ──────────────────────────────────────────────────────────────────────
# Stage 2: Build the Backend & Final Image
# ──────────────────────────────────────────────────────────────────────
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && \
    rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy frontend build from Stage 1
# This assumes the backend is configured to serve static files from /app/static
COPY --from=frontend-builder /app/dist /app/static

# Environment defaults (Note: Mongo, GCP, Gemini must be provided via ENV)
ENV PORT=8002
ENV ENVIRONMENT=production

EXPOSE 8002

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
