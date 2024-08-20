# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies, including Rust and Cargo
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    capnproto \
    && rm -rf /var/lib/apt/lists/*

# Install Rust and Cargo
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install hypercorn
RUN pip install --no-cache-dir hypercorn

# Make port 5001 available to the world outside this container
EXPOSE 5001

# Run hypercorn when the container launches
CMD ["hypercorn", "app:app", "--bind", "0.0.0.0:5001", "--workers", "4", "--keep-alive", "300", "--graceful-timeout", "300", "--log-level", "debug", "--access-logfile", "access.log", "--error-logfile", "error.log"]