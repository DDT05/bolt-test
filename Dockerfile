# Use Node.js LTS (Long Term Support) as base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Set environment variables
ENV VITE_SUPABASE_URL=https://cabpnambmgtyqhknclcj.supabase.co
ENV VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhYnBuYW1ibWd0eXFoa25jbGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzA3NjksImV4cCI6MjA1ODQwNjc2OX0.g69gVSFXynmBFH7T1V4152QdCgYObhrI0G_J_EJvZrE
ENV VITE_LUMA_API_KEY=luma-d0cf1c1f-8c3a-44a2-ad0d-7492fc0790cc-c005fcc4-66f1-44b1-b0dd-89c1e3acd221
ENV VITE_FLOWISE_API_URL=https://hebed-workspace.onrender.com/api/v1/prediction/1ee6a47e-8ba8-4e95-8c1e-8289f5629cca

# Expose port 5173 for Vite dev server
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host"]