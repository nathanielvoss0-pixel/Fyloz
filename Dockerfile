FROM busybox:1.36

WORKDIR /www
COPY index.html /www/index.html
COPY favicon.svg /www/favicon.svg
COPY styles.css /www/styles.css
COPY theme.js /www/theme.js
COPY app.js /www/app.js
COPY privacy.html /www/privacy.html
COPY terms.html /www/terms.html
COPY contact.html /www/contact.html
COPY sitemap.xml /www/sitemap.xml
COPY robots.txt /www/robots.txt
COPY resize-image /www/resize-image
COPY convert-image /www/convert-image
COPY edit-image /www/edit-image
COPY watermark-image /www/watermark-image
COPY compress-image-to-200kb /www/compress-image-to-200kb
COPY compress-image-to-50kb /www/compress-image-to-50kb
COPY compress-image-to-100kb /www/compress-image-to-100kb
COPY guides /www/guides
COPY pdf-tools /www/pdf-tools
COPY ar /www/ar
COPY fr /www/fr

EXPOSE 8080
CMD ["httpd", "-f", "-p", "8080", "-h", "/www"]
