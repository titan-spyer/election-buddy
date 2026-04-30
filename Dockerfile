# Use an official lightweight Python image.
FROM python:3.11-slim

# Allow statements and log messages to immediately appear in the Cloud Run logs
ENV PYTHONUNBUFFERED=1

# Set the working directory to /app
WORKDIR /app

# Copy requirements.txt and install dependencies
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Run collectstatic (will use SQLite locally or simply gather static files)
RUN python manage.py collectstatic --noinput

# Run the web service on container startup using Gunicorn
# This will automatically migrate the database and load data.json on deployment
CMD python manage.py migrate && python manage.py loaddata data.json && exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 8 --timeout 0 election_project.wsgi:application
