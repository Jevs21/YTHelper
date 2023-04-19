all: clean build run

run:
	cd server && npm run start

build:
	cd client && npm run build
	cp -r ./client/build/* ./server/public/

clean:
	rm -rf server/public/*

install:
	cd client && npm install
	cd server && npm install

install-deps:
	apt install npm
	npm install -g n
	npm install -g sequelize-cli
	n latest
	apt install sqlite3
	apt install vite
	apt install python3
	apt install python3-pip
	apt install ffmpeg
	apt install sox
	apt install libsox-fmt-mp3
	python3 -m pip install -r server/python/requirements.txt