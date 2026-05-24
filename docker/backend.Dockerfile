# ===== Stage 1: Build =====
FROM python:3.11-slim AS builder

WORKDIR /app

# Stops Python from generating .pyc files.
ENV PYTHONDONTWRITEBYTECODE=1 
# Forces Python to print output directly to the terminal without buffering to ensures your CI pipeline and log analyzers capture logs in real-time.
ENV PYTHONUNBUFFERED=1

# Copy requirements first for better caching
COPY backend/requirements.txt ./
RUN python -m pip install --upgrade pip setuptools wheel \
    && python -m pip install --no-cache-dir -r requirements.txt

# ===== Stage 2: Runtime =====
FROM python:3.11-slim AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# used to ensure the container can run a script to check if the database is awake before trying to connect to it. It immediately deletes the apt cache to keep the image size down.
RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Containers run as the root user by default, which is a security risk. This creates a standard user named spice with limited permissions.
RUN groupadd -r spice && useradd -r -g spice -d /app -s /usr/sbin/nologin spice

# Copy installed Python packages from the build stage
COPY --from=builder /usr/local /usr/local

# Copy application code
COPY backend/ /app

# startup script that usually handles database migrations or startup checks before launching the main app.
COPY backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
    && chown -R spice:spice /app /entrypoint.sh

# Switch to non-root user
USER spice

EXPOSE 8000
# send a polite "please shut down" signal instead of a harsh "kill" signal when stopping the container,allowing app to close database connections gracefully.
STOPSIGNAL SIGTERM

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/')"]

ENTRYPOINT ["/entrypoint.sh"]