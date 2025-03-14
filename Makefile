ECR_REPO := 383266146290.dkr.ecr.eu-central-1.amazonaws.com/chaindensity
GIT_SHA := $(shell git rev-parse --short HEAD)
PLATFORMS := linux/amd64,linux/arm64

# Frontend and backend tags
FRONTEND_TAG := frontend-$(GIT_SHA)
FRONTEND_LATEST := frontend-latest
BACKEND_TAG := backend-$(GIT_SHA)
BACKEND_LATEST := backend-latest

.PHONY: docker-login
docker-login:
	aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin $(ECR_REPO)

.PHONY: docker-build-frontend
docker-build-frontend: docker-login
	docker buildx build \
		-f Dockerfile.frontend \
		-t $(ECR_REPO):$(FRONTEND_TAG) \
		-t $(ECR_REPO):$(FRONTEND_LATEST) \
		--platform $(PLATFORMS) \
		--push \
		.

.PHONY: docker-build-backend
docker-build-backend: docker-login
	docker buildx build \
		-f Dockerfile.backend \
		-t $(ECR_REPO):$(BACKEND_TAG) \
		-t $(ECR_REPO):$(BACKEND_LATEST) \
		--platform $(PLATFORMS) \
		--push \
		.

# Build both frontend and backend images
.PHONY: docker-build-all
docker-build-all: docker-build-frontend docker-build-backend

