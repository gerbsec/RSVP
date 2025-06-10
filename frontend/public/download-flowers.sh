#!/bin/bash

# Create images directory if it doesn't exist
mkdir -p images

# Download flower images
curl -o images/flower1.png https://raw.githubusercontent.com/your-repo/rsvp-website/main/frontend/public/images/flower1.png
curl -o images/flower2.png https://raw.githubusercontent.com/your-repo/rsvp-website/main/frontend/public/images/flower2.png
curl -o images/flower3.png https://raw.githubusercontent.com/your-repo/rsvp-website/main/frontend/public/images/flower3.png

# Move images to public directory
mv images/* public/
rmdir images 