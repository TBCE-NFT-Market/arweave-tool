#!/bin/bash
echo "Pulling from remote..."
git pull
echo "Cleaning build & /var/www/artools folder..."
rm -rf build
sudo rm -rf /var/www/artools
echo "Building artools..."
npm run build
echo "Moving files to public directory..."
cd build
sudo mkdir /var/www/artools
sudo mv * /var/www/artools .
echo "Applying permissions..."
sudo chmod -R 755 /var/www/artools
sudo chown -R www-data:www-data /var/www/artools

echo "Ready!"
