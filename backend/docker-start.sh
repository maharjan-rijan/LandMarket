#!/bin/sh
set -e

# Render tells the app which port to use in $PORT
PORT="${PORT:-10000}"
sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/:80>/:${PORT}>/" /etc/apache2/sites-available/000-default.conf

php artisan config:cache
php artisan route:cache
php artisan storage:link || true
php artisan migrate --force

exec apache2-foreground
