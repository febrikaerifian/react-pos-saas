const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

/* ================= HELPER FILTER ================= */
const buildFilter = (req) => {
  const { branch_id, search } = req.query;
  const user = req.user;

  let conditions = [];
  let values = [];
  let index = 1;

  conditions.push(`company_id = $${index++}`);
  values.push(user.company_id);

  if (user.role === 'cashier') {
    conditions.push(`branch_id = $${index++}`);
    values.push(user.branch_id);
  } else if (branch_id) {
    conditions.push(`branch_id = $${index++}`);
    values.push(branch_id);
  }

  if (search) {
    conditions.push(`LOWER(name) LIKE $${index++}`);
    values.push(`%${search.toLowerCase()}%`);
  }

  conditions.push(`is_active = true`);

  return { where: `WHERE ${conditions.join(' AND ')}`, values };
};

/* ================= GET PRODUCTS ================= */
router.get('/', auth, async (req, res) => {
  try {
    const { where, values } = buildFilter(req);
    const result = await pool.query(`
      SELECT *
      FROM products
      ${where}
      ORDER BY created_at DESC
    `, values);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ================= CREATE PRODUCT (ADMIN) ================= */
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Admin only' });

    const { branch_id, name, price, stock } = req.body;

    if (!branch_id) return res.status(400).json({ message: 'branch_id is required' });
    const branchIdInt = parseInt(branch_id);
    if (isNaN(branchIdInt)) return res.status(400).json({ message: 'branch_id must be an integer' });

    const result = await pool.query(`
      INSERT INTO products
      (company_id, branch_id, uuid, name, price, stock, is_active)
      VALUES ($1,$2,$3,$4,$5,$6,true)
      RETURNING *
    `, [req.user.company_id, branchIdInt, uuidv4(), name, price, stock]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ================= UPDATE PRODUCT (ADMIN) ================= */
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Admin only' });

    const { branch_id, name, price, stock } = req.body;

    if (!branch_id) return res.status(400).json({ message: 'branch_id is required' });
    const branchIdInt = parseInt(branch_id);
    if (isNaN(branchIdInt)) return res.status(400).json({ message: 'branch_id must be an integer' });

    const result = await pool.query(`
      UPDATE products
      SET name=$1,
          price=$2,
          stock=$3,
          branch_id=$4,
          updated_at=NOW()
      WHERE id=$5 AND company_id=$6 AND is_active = true
      RETURNING *
    `, [name, price, stock, branchIdInt, req.params.id, req.user.company_id]);

    if (!result.rows[0]) return res.status(404).json({ message: 'Product not found or inactive' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ================= SOFT DELETE PRODUCT ================= */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Admin only' });

    await pool.query(`
      UPDATE products
      SET is_active = false
      WHERE id = $1 AND company_id=$2
    `, [req.params.id, req.user.company_id]);

    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;