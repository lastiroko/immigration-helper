# syntax=docker/dockerfile:1.6
#
# Multi-stage build for the Helfa backend. Build context is the backend/ folder.
# On Railway / Fly / Render, set the service Root Directory to "backend".

# ── Stage 1: build the JAR ───────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Resolve dependencies first so source-only changes don't bust the layer cache.
COPY pom.xml ./
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -q -DskipTests dependency:go-offline

# Compile + package, skipping tests (CI runs them separately).
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -q -DskipTests package && \
    cp target/*.jar /workspace/app.jar

# ── Stage 2: minimal runtime ─────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root and pre-create the local-storage path so LocalFileStorageService
# can write to it (or mount a volume / swap to S3 in production).
RUN addgroup -S app && adduser -S app -G app && \
    mkdir -p /app/uploads && chown -R app:app /app
USER app

COPY --from=build --chown=app:app /workspace/app.jar /app/app.jar

ENV APP_STORAGE_BASE_PATH=/app/uploads \
    SERVER_PORT=8080 \
    JAVA_OPTS=""

EXPOSE 8080

# Honour Railway/Heroku-style $PORT if set; otherwise fall back to SERVER_PORT.
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar --server.port=${PORT:-${SERVER_PORT:-8080}}"]
