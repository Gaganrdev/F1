# Use an official Node.js image based on Debian
FROM node:20-bookworm-slim

# Install Python 3, pip, and virtual environment dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package files and install Node.js dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Set up the Python virtual environment and install FastF1 / dependencies
RUN python3 -m venv python_scripts/venv
RUN ./python_scripts/venv/bin/pip install --no-cache-dir -r python_scripts/requirements.txt

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "start"]
