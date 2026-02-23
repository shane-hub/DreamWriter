# Use the official Python Alpine image for a smaller footprint
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy requirement list first for better cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
