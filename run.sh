#/bin/bash

if [ "$(sudo docker ps -q)" ]; then
    echo "Stopping running containers..."
    sudo docker stop $(sudo docker ps -q)
    
    echo "Waiting for all containers to stop..."
    sudo docker container wait $(sudo docker ps -aq)
else
    echo "No running containers found"
fi

if [ "$(sudo docker image ls -q)" ]; then
    echo "Deleting existing images..."
    sudo docker image rm $(sudo docker image ls -q)
else
    echo "No existing images found"
fi

echo "Building container..."
sudo docker build -t express-ts -f docker/Dockerfile .

echo "Running container..."
sudo docker run -d -p 80:8080 express-ts