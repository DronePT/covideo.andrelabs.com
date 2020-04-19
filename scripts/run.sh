#!/usr/bin/env bash
docker container rm -f covideo.andrelabs.com
docker container run -d --name covideo.andrelabs.com \
        -e "NODE_ENV=production" \
        -e "VIRTUAL_HOST=covideo.andrelabs.com" \
        -e "LETSENCRYPT_HOST=covideo.andrelabs.com" \
        -e "LETSENCRYPT_EMAIL=dronept@gmail.com" \
        covideo.andrelabs.com
