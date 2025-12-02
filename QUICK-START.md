# Ghost Crossing - Quick Start Guide

## 🚀 Fastest Way to Run

```bash
docker-compose up -d
```

Then open: **http://localhost:8080**

## 🛑 Stop the Game

```bash
docker-compose down
```

## 📋 What Was Built

Your Ghost Crossing game is now fully containerized with:

### Core Container Files
- **Dockerfile** - Lightweight nginx:alpine container (~23MB)
- **docker-compose.yml** - One-command deployment
- **nginx.conf** - Optimized static file serving

### Helper Scripts
- `build.sh` - Build the Docker image
- `run.sh` - Run the container
- `stop.sh` - Stop and cleanup

### Comprehensive Tests
- `test-unit.sh` - Container functionality tests
- `test-property-mime.sh` - MIME type correctness (100+ iterations)
- `test-property-integrity.sh` - File integrity verification (100+ iterations)
- `test-integration.sh` - End-to-end integration tests
- `run-all-tests.sh` - Run all tests at once

## 🧪 Run Tests (Optional)

```bash
./run-all-tests.sh
```

## 🌐 Deploy to Cloud

### AWS ECS
```bash
docker build -t ghost-crossing:latest .
# Push to ECR and create ECS service
```

### Google Cloud Run
```bash
gcloud builds submit --tag gcr.io/PROJECT/ghost-crossing
gcloud run deploy ghost-crossing --image gcr.io/PROJECT/ghost-crossing
```

### Heroku
```bash
heroku container:push web -a APP_NAME
heroku container:release web -a APP_NAME
```

See README.md for detailed deployment instructions.

## 🎮 Game Controls

- **Arrow Keys** or **WASD** to move
- Avoid obstacles
- Reach all 4 goal zones to win!

## 📚 Full Documentation

See **README.md** for complete documentation including:
- Detailed deployment guides
- Troubleshooting tips
- Development workflow
- Architecture details
