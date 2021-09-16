# fuzzy-waffle

docker linux install
```bash
apt-get update
apt-get install -y apt-transport-https ca-certificates curl
curl -s "https://get.docker.com" | bash
curl -L "https://github.com/docker/compose/releases/download/1.29.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

after clonning:
* Dirty rights allowance for the db
  ```bash
  chmod -R 777 ./back/rethink/
  ```

* Edit `sample.env` then copy past his content into your `.env`
  ```bash
  naon sample.env
  cat sample.env > .env
  ```
  
* Launch the local env
  ```bash
  docker-compose -f docker-compose.local.yml up -d --build
  ```
