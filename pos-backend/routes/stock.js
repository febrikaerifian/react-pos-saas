const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');


// ===============================
// GET STOCK LIST
// ===============================
router.get('/', auth, async (req, res) => {
  let { branch_id } = req.query;

  try {
    let query = `
      SELECT 
        p.id,
        p.name,
        p.stock,
        b.name AS branch_name,
        COALESCE(SUM(ti.quantity), 0) AS sold
      FROM products p
      LEFT JOIN branches b 
        ON p.branch_id = b.id
      LEFT JOIN transaction_items ti 
        ON ti.product_id = p.id
      LEFT JOIN transactions t
        ON t.id = ti.transaction_id
        AND t.company_id = p.company_id
      WHERE p.company_id = $1
    `;

    const params = [req.user.company_id];
    let paramIndex = 2;

    // 🔐 FILTER BRANCH (AMAN NUMBER)
    if (branch_id && !isNaN(branch_id)) {
      query += ` AND p.branch_id = $${paramIndex}`;
      params.push(Number(branch_id));
      paramIndex++;
    }

    query += `
      GROUP BY p.id, p.name, p.stock, b.name
      ORDER BY p.name ASC
    `;

    const result = await pool.query(query, params);

    res.json(result.rows);

  } catch (err) {
    console.error("STOCK ERROR:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;