# Sounds-check

- Harmony Check
- Pitch Check
- Load an audio file and check the harmony
  →　「音楽ファイルを選択」→　「再生」　→　「一時停止」　→　「音声固定」

## Composition
```
root
└ css
  └ style.css
└ html
  └ index.html
└ js
  └ index.js
└ nginx
  └ default.conf
└ Dockerfile
└ docker-compose.yml
```

### default.conf
```
# nginx/default.conf
server {
    listen 443 ssl;
    server_name localhost;

    ssl_certificate     /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
}

```

### docker-compose.yml
```
version: '3.8'

services:
  web:
    build: .
    ports:
      - "443:443"

```

### Dockerfile
```
# Dockerfile
FROM nginx:alpine

# OpenSSLを使うためにインストール
RUN apk add --no-cache openssl

# HTML・nginx設定をコピー
COPY ./html /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# SSLディレクトリを作成して証明書を生成
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -subj "/C=JP/ST=Tokyo/L=Chiyoda/O=Dev/CN=localhost"

```

### Commands
```
// First
docker compose up --build
// Next
docker compose up
// Stop
docker compose down
```

### Development URL
Local：https://localhost

### Deploy URL
https://seiryu1996.github.io/sounds-check/html/