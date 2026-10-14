FROM busybox:1.36

WORKDIR /www
COPY index.html /www/index.html
COPY styles.css /www/styles.css
COPY app.js /www/app.js

EXPOSE 8080
CMD ["httpd", "-f", "-p", "8080", "-h", "/www"]
