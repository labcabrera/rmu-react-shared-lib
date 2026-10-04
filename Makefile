REMOTE         ?= origin
MASTER_BRANCH  ?= master
DEVELOP_BRANCH ?= develop
RELEASE_BUMP   ?=
PACKAGE_NAME   := $(shell node -p "require('./package.json').name")

.DEFAULT_GOAL := help
.PHONY: help build link create-release

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

build: ## Compile the library with tsc into dist/
	npm run build

link: build ## Build and register the package globally with npm link (then run 'npm link <package>' in the consuming MFE)
	npm link
	@echo "Linked $(PACKAGE_NAME). In the consuming MFE run: npm link $(PACKAGE_NAME)"

create-release: ## Release develop to master with semantic-release (tag + CHANGELOG), push, and bump develop to next -SNAPSHOT. Optional RELEASE_BUMP=patch|minor|major
	@test "$$(git branch --show-current)" = "$(DEVELOP_BRANCH)" || { echo "Releases must start from '$(DEVELOP_BRANCH)' (current: $$(git branch --show-current))" >&2; exit 1; }
	@test -z "$$(git status --porcelain)" || { echo "Working directory is not clean:" >&2; git status --short >&2; exit 1; }
	git fetch --tags $(REMOTE)
	git pull --ff-only $(REMOTE) $(DEVELOP_BRANCH)
	git checkout $(MASTER_BRANCH) 2>/dev/null || git checkout -b $(MASTER_BRANCH) --track $(REMOTE)/$(MASTER_BRANCH)
	git pull --ff-only $(REMOTE) $(MASTER_BRANCH)
	git merge --no-ff --no-edit -m "Merge branch '$(DEVELOP_BRANCH)' into $(MASTER_BRANCH)" $(DEVELOP_BRANCH)
	@RELEASE_BUMP="$(RELEASE_BUMP)" npx --no -- semantic-release --no-ci \
		&& git describe --exact-match --tags HEAD >/dev/null 2>&1 \
		|| { echo "No release was created, restoring $(MASTER_BRANCH) and returning to $(DEVELOP_BRANCH)" >&2; \
			git reset -q --hard $(REMOTE)/$(MASTER_BRANCH); git checkout -q $(DEVELOP_BRANCH); exit 1; }
	git checkout $(DEVELOP_BRANCH)
	git merge --no-edit $(MASTER_BRANCH)
	@version=$$(node -p "require('./package.json').version"); \
		next=$$(npx --no -- semver -i patch "$$version")-SNAPSHOT; \
		npm version --no-git-tag-version "$$next" >/dev/null \
		&& git commit -q -m "chore: prepare next development version $$next" package.json package-lock.json \
		&& echo "Released $$version, $(DEVELOP_BRANCH) is now at $$next"
	git push $(REMOTE) $(DEVELOP_BRANCH)
