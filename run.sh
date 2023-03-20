#/bin/bash

sudo docker build -t express-ts -f docker/Dockerfile .

sudo docker run -d -p 80:8080 express-ts