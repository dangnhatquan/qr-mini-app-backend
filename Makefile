bootstrap:
	npm install
	cp env-example-relational .env

config:
	npm run app:config

gen-migration:
	npm run migration:create

migration:
	npm run migration:run

seed:
	npm run seed:run:relational

dev:
	npm run start:dev

up:
	docker compose up -d postgres adminer maildev minio

ngrok:
	ngrok http 8000

build:
	npm run build