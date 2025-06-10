# RSVP Website

A beautiful and interactive RSVP website with an animated envelope, RSVP form, and admin dashboard.

## Features

- Animated envelope reveal with personalized invitation
- Beautiful flower animations throughout the interface
- RSVP form with support for additional guests (up to 3)
- Password-protected admin dashboard with real-time statistics
- Responsive design that works on all devices
- PostgreSQL database integration
- Secure authentication for admin access

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Local Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd rsvp-website
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install --legacy-peer-deps
cd ..
```

4. Create a `.env` file in the root directory:
```bash
echo "PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rsvp_db
JWT_SECRET=your-super-secret-key-change-this-in-production
ADMIN_PASSWORD=admin123
NODE_ENV=development" > .env
```

5. Create and set up the database:
```bash
# Create PostgreSQL user if it doesn't exist
createuser -s postgres

# Create the database
createdb rsvp_db
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Admin Access

The admin dashboard is accessible at `/admin` and is protected by a password. The default password is `admin123`. You can change this in the `.env` file.

The admin dashboard provides:
- Total number of RSVPs received
- Number of guests attending
- Number of guests not attending
- Total number of guests (including additional guests)
- Detailed list of all RSVPs with guest information

## Digital Ocean Deployment

1. Create a new Digital Ocean droplet (Ubuntu 22.04 LTS recommended)

2. Connect to your droplet and install dependencies:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

3. Set up PostgreSQL:
```bash
# Create database and user
sudo -u postgres psql
postgres=# CREATE DATABASE rsvp_db;
postgres=# CREATE USER rsvp_user WITH ENCRYPTED PASSWORD 'your_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE rsvp_db TO rsvp_user;
postgres=# \q
```

4. Clone and set up the application:
```bash
# Clone your repository
git clone <repository-url>
cd rsvp-website

# Install dependencies
npm install
cd frontend && npm install --legacy-peer-deps && cd ..

# Create .env file
nano .env
# Add your environment variables

# Build the frontend
cd frontend && npm run build && cd ..

# Start the application with PM2
pm2 start npm --name "rsvp-website" -- start
```

5. Configure Nginx:
```bash
sudo nano /etc/nginx/sites-available/rsvp-website

# Add the following configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/your/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/rsvp-website /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. Set up SSL with Let's Encrypt:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Troubleshooting

1. If you encounter dependency issues:
```bash
# In the frontend directory
npm install --legacy-peer-deps
```

2. If the database connection fails:
- Check if PostgreSQL is running: `sudo service postgresql status`
- Verify database credentials in `.env`
- Ensure the database exists: `psql -l`

3. If the admin dashboard shows a 401 error:
- Clear your browser's local storage
- Try logging in again with the correct password
- Check the JWT_SECRET in your .env file

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.