# Use official Python image
FROM python:3.11

# Install uv package manager
RUN pip install uv

# Set the working directory
WORKDIR /app

# Copy the project files
COPY pyproject.toml ./

# Install dependencies with uv
RUN uv pip install --system

# Copy the application code
COPY main.py main.py

# Set the command to run the Textual app
CMD ["python", "main.py"]