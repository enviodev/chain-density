ECR_REPO := 383266146290.dkr.ecr.eu-central-1.amazonaws.com/chaindensity
GIT_SHA := $(shell git rev-parse --short HEAD)
PLATFORMS := linux/amd64,linux/arm64


.PHONY: docker-login
docker-login:
	aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin $(ECR_REPO)

.PHONY: docker-build
docker-build: docker-login
	docker buildx build \
		-f Dockerfile \
		-t $(ECR_REPO):$(GIT_SHA) \
		-t $(ECR_REPO):latest \
		--platform $(PLATFORMS) \
		--push \
		.