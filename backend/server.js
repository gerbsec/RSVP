require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to database');
  release();
});

// Create tables if they don't exist
const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rsvps (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        response VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS additional_guests (
        id SERIAL PRIMARY KEY,
        rsvp_id INTEGER REFERENCES rsvps(id) ON DELETE CASCADE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS admin_credentials (
        id SERIAL PRIMARY KEY,
        password_hash VARCHAR(255) NOT NULL
      );
    `);

    // Check if admin credentials exist, if not create default
    const adminCheck = await pool.query('SELECT * FROM admin_credentials LIMIT 1');
    if (adminCheck.rows.length === 0) {
      const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      await pool.query('INSERT INTO admin_credentials (password_hash) VALUES ($1)', [passwordHash]);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Initialize database
initializeDatabase();

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// API Routes
app.post('/api/rsvp', async (req, res) => {
  const { firstName, lastName, email, phone, response, additionalGuests } = req.body;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert RSVP
      const rsvpResult = await client.query(
        'INSERT INTO rsvps (first_name, last_name, email, phone, response) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [firstName, lastName, email, phone, response]
      );

      const rsvpId = rsvpResult.rows[0].id;

      // Insert additional guests if any
      if (response === 'yes' && additionalGuests && additionalGuests.length > 0) {
        for (const guest of additionalGuests) {
          await client.query(
            'INSERT INTO additional_guests (rsvp_id, first_name, last_name) VALUES ($1, $2, $3)',
            [rsvpId, guest.firstName, guest.lastName]
          );
        }
      }

      await client.query('COMMIT');
      res.status(201).json({ message: 'RSVP submitted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    res.status(500).json({ error: 'Error submitting RSVP' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM admin_credentials LIMIT 1');
    const admin = result.rows[0];

    if (!admin) {
      return res.status(401).json({ error: 'Admin credentials not found' });
    }

    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: admin.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Error during login' });
  }
});

app.get('/api/admin/rsvps', verifyAdminToken, async (req, res) => {
  try {
    const rsvpsResult = await pool.query(`
      SELECT 
        r.*,
        COALESCE(json_agg(
          json_build_object(
            'firstName', ag.first_name,
            'lastName', ag.last_name
          )
        ) FILTER (WHERE ag.id IS NOT NULL), '[]') as additional_guests
      FROM rsvps r
      LEFT JOIN additional_guests ag ON r.id = ag.rsvp_id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `);

    const statsResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE response = 'yes') as attending,
        COUNT(*) FILTER (WHERE response = 'no') as not_attending,
        (SELECT COUNT(*) FROM additional_guests) as total_guests
      FROM rsvps
    `);

    res.json({
      rsvps: rsvpsResult.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    res.status(500).json({ error: 'Error fetching RSVPs' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});