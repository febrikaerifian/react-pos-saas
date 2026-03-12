const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');


// ===============================
// GET all users (by company)
// ===============================
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.company_id, u.branch_id, 
              u.name, u.email, u.role, u.created_at,
              b.name as branch_name
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.company_id = $1
       ORDER BY u.created_at DESC`,
      [req.user.company_id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ===============================
// CREATE user
// ===============================
router.post('/', auth, async (req, res) => {
  const { branch_id, name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check email duplicate
    const checkEmail = await pool.query(
      `SELECT id FROM users 
       WHERE email = $1 AND company_id = $2`,
      [email, req.user.company_id]
    );

    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
       (company_id, branch_id, name, email, password, role, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW())
       RETURNING id, company_id, branch_id, name, email, role, created_at`,
      [
        req.user.company_id,
        branch_id || null,
        name,
        email,
        hashedPassword,
        role
      ]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ===============================
// UPDATE user
// ===============================
router.put('/:id', auth, async (req, res) => {
  const { branch_id, name, email, password, role } = req.body;

  try {
    let query = `
      UPDATE users
      SET branch_id = $1,
          name = $2,
          email = $3,
          role = $4
    `;

    const params = [
      branch_id || null,
      name,
      email,
      role
    ];

    // If password diubah
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = $5 WHERE id = $6 AND company_id = $7 RETURNING id, company_id, branch_id, name, email, role, created_at`;
      params.push(hashedPassword, req.params.id, req.user.company_id);
    } else {
      query += ` WHERE id = $5 AND company_id = $6 RETURNING id, company_id, branch_id, name, email, role, created_at`;
      params.push(req.params.id, req.user.company_id);
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ===============================
// DELETE user
// ===============================
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM users
       WHERE id = $1 AND company_id = $2
       RETURNING id`,
      [req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;