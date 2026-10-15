FROM busybox:1.36

WORKDIR /www
COPY index.html /www/index.html
COPY favicon.svg /www/favicon.svg
COPY styles.css /www/styles.css
COPY app.js /www/app.js
COPY privacy.html /www/privacy.html
COPY terms.html /www/terms.html
COPY contact.html /www/contact.html
COPY sitemap.xml /www/sitemap.xml
COPY robots.txt /www/robots.txt
COPY resize-image /www/resize-image\nCOPY convert-image /www/convert-image

EXPOSE 8080
CMD ["httpd", "-f", "-p", "8080", "-h", "/www"]
