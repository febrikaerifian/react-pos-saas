const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// GET all branches for company
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches WHERE company_id=$1', [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create branch
router.post('/', auth, async (req, res) => {
  const { name, address, phone } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO branches (company_id,name,address,phone) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.user.company_id, name, address, phone]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update branch
router.put('/:id', auth, async (req, res) => {
  const { name, address, phone } = req.body;
  try {
    const result = await pool.query(
      'UPDATE branches SET name=$1,address=$2,phone=$3 WHERE id=$4 AND company_id=$5 RETURNING *',
      [name, address, phone, req.params.id, req.user.company_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE branch
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM branches WHERE id=$1 AND company_id=$2', [req.params.id, req.user.company_id]);
    res.json({ message: 'Branch deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;