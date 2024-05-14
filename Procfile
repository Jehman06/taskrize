release: cd backend/task_management && python manage.py migrate
web: uvicorn task_management.asgi:application --host 0.0.0.0 --port ${PORT:-5000}