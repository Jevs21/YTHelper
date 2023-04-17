all: clean build run

run:
	cd server && npm run start

build:
	cd client && npm run build
	cp -r ./client/build/* ./server/public/

clean:
	rm -rf server/public/*