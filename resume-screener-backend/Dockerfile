# Build Stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy POM and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build package
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

# Tuned for Render free tier (512 MB RAM):
#  - UseSerialGC: avoids parallel GC thread overhead on shared CPUs
#  - MaxRAMPercentage=75: caps heap at ~384 MB, leaving room for metaspace/stack
#  - TieredStopAtLevel=1: skips expensive JIT optimisation tiers → faster startup
#  - Xss512k: smaller thread stack size (default 1 MB per thread)
ENTRYPOINT ["java", "-XX:+UseSerialGC", "-XX:MaxRAMPercentage=75", "-XX:TieredStopAtLevel=1", "-Xss512k", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
