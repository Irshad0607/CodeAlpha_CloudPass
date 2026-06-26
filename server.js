require('dotenv').config();
const express = require('express');
const mssql = require('mssql');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

const PRICES = {
  student: 300,
  monthly: 500,
  quarterly: 1200
};

function generatePassNumber() {
  return 'PASS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

// Register
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' });

  try {
    const pool = await mssql.connect(dbConfig);
    const existing = await pool.request()
      .input('email', mssql.NVarChar, email)
      .query('SELECT id FROM Users WHERE email = @email');

    if (existing.recordset.length > 0)
      return res.status(400).json({ message: 'Email already registered' });

    await pool.request()
      .input('name', mssql.NVarChar, name)
      .input('email', mssql.NVarChar, email)
      .input('password', mssql.NVarChar, password)
      .query('INSERT INTO Users (name, email, password) VALUES (@name, @email, @password)');

    res.json({ message: 'Registration successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'All fields required' });

  try {
    const pool = await mssql.connect(dbConfig);
    const result = await pool.request()
      .input('email', mssql.NVarChar, email)
      .input('password', mssql.NVarChar, password)
      .query('SELECT id, name FROM Users WHERE email = @email AND password = @password');

    if (result.recordset.length === 0)
      return res.status(401).json({ message: 'Invalid email or password' });

    const user = result.recordset[0];
    res.json({ message: 'Login successful', userId: user.id, name: user.name });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Apply Pass
app.post('/apply-pass', async (req, res) => {
  const { userId, route, destination, passType } = req.body;
  if (!userId || !route || !destination || !passType)
    return res.status(400).json({ message: 'All fields required' });

  const type = passType.toLowerCase();
  if (!PRICES[type])
    return res.status(400).json({ message: 'Invalid pass type' });

  const price = PRICES[type];

  try {
    const pool = await mssql.connect(dbConfig);

    const existing = await pool.request()
      .input('userId', mssql.Int, userId)
      .query("SELECT id FROM BusPasses WHERE user_id = @userId AND status = 'active'");

    if (existing.recordset.length > 0)
      return res.status(400).json({ message: 'You already have an active pass. Cannot apply for another.' });

    const passNumber = generatePassNumber();

    await pool.request()
      .input('userId', mssql.Int, userId)
      .input('route', mssql.NVarChar, route)
      .input('destination', mssql.NVarChar, destination)
      .input('passType', mssql.NVarChar, type)
      .input('price', mssql.Decimal, price)
      .input('passNumber', mssql.NVarChar, passNumber)
      .query(`INSERT INTO BusPasses (user_id, route, destination, pass_type, price, pass_number, status, created_at)
              VALUES (@userId, @route, @destination, @passType, @price, @passNumber, 'active', GETDATE())`);

    res.json({ message: 'Pass applied successfully', passNumber, price });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get Pass
app.get('/pass/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const pool = await mssql.connect(dbConfig);
    const result = await pool.request()
      .input('userId', mssql.Int, userId)
      .query('SELECT * FROM BusPasses WHERE user_id = @userId ORDER BY created_at DESC');

    if (result.recordset.length === 0)
      return res.status(404).json({ message: 'No passes found' });

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CloudPass running on port ${PORT}`));
