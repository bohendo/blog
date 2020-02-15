FROM alpine:3.10

RUN apk add --update --no-cache bash certbot curl iputils nginx openssl && \
    openssl dhparam -out /etc/ssl/dhparam.pem 2048 && \
    ln -fs /dev/stdout /var/log/nginx/access.log && \
    ln -fs /dev/stdout /var/log/nginx/error.log

COPY ops/wait-for.sh /root/wait-for.sh
COPY modules/proxy/prod.conf /etc/nginx/nginx.conf
COPY modules/proxy/entry.sh /root/entry.sh
COPY modules/client/build /var/www/html/client

ENTRYPOINT ["bash", "/root/entry.sh"]
