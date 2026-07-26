# SARCONX — static + PHP site (Apache + mod_php)
# Serves the HTML/CSS/JS statically AND executes send-email.php
FROM php:8.3-apache

# Useful Apache modules (headers for CORS on the PHP endpoint, rewrite just in case)
RUN a2enmod rewrite headers

# Raise PHP upload/POST limits a bit (contact form attachments, if ever)
RUN { \
      echo 'upload_max_filesize = 8M'; \
      echo 'post_max_size = 12M'; \
      echo 'memory_limit = 128M'; \
    } > /usr/local/etc/php/conf.d/sarconx.ini

# 301 redirects for old (removed) pages + custom 404, at server-config level
COPY apache-redirects.conf /etc/apache2/conf-enabled/sarconx.conf

# Copy the site into the Apache document root
COPY . /var/www/html/

# Correct ownership for www-data
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
