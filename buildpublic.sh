#!/bin/bash
git pull
npm run build
cd build
mv * /var/www/artools .
sudo chmod -R 755 /var/www/artools
sudo chown -R www-data:www-data /var/www/artools

