# Baseline Dockerfile for Campus Accessibility Reporter (Question 1a & 2c)
FROM node:20

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose internal port
EXPOSE 5000

# Runs as default user (root) - used as baseline for Trivy vulnerability comparison
CMD ["npm", "start"]
