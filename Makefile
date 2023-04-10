.PHONY: build run clean

build:
	docker build --build-arg MODE=development -t yt-helper .


run:
	docker run -p 3000:3000 --rm --name yt-helper-instance yt-helper

clean:
	-docker stop yt-helper-instance
	-docker rm yt-helper-instance
	-docker rmi yt-helper

rebuild: clean build run
