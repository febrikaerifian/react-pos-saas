const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// ===============================
// LOGIN
// ===============================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Cari user (case insensitive)
    const userResult = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    // 2️⃣ WAJIB bcrypt compare
    const validPass = await bcrypt.compare(password, user.password);

    if (!validPass) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // 3️⃣ Generate token
    const token = jwt.sign(
      {
        id: user.id,
        company_id: user.company_id,
        branch_id: user.branch_id,
        role: user.role
      },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: '7d' }
    );

    // 4️⃣ Response
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        branch_id: user.branch_id
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
