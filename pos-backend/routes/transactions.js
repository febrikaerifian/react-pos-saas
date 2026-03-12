const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');


// ===============================
// GET transactions + filter date
// ===============================
router.get('/', auth, async (req, res) => {
  const { branch_id, start_date, end_date } = req.query;

  try {
    let query = `
      SELECT t.*, u.name as cashier_name
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.company_id = $1
    `;

    const params = [req.user.company_id];
    let paramIndex = 2;

    // 🔹 Filter branch
    if (branch_id && !isNaN(branch_id)) {
      query += ` AND t.branch_id = $${paramIndex}`;
      params.push(Number(branch_id));
      paramIndex++;
    }

    // 🔹 Filter start date
    if (start_date) {
      query += ` AND DATE(t.created_at) >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    // 🔹 Filter end date
    if (end_date) {
      query += ` AND DATE(t.created_at) <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = await pool.query(query, params);

    res.json(result.rows);

  } catch (err) {
    console.error("GET TRANSACTION ERROR:", err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ===============================
// POST create transaction
// ===============================
router.post('/', auth, async (req, res) => {

  const { branch_id, items, total, payment } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Generate invoice otomatis
    const invoice_number = 'INV-' + Date.now();

    // Insert transaction
    const tx = await client.query(
      `INSERT INTO transactions 
      (company_id, branch_id, invoice_number, total, payment_method, payment, change_amount, user_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        req.user.company_id,
        branch_id || null,
        invoice_number,
        total,
        'CASH',
        payment,
        payment - total,
        req.user.id
      ]
    );

    const tx_id = tx.rows[0].id;

    // Insert items + reduce stock
    for (let item of items) {

      // Validasi stok dulu
      const productCheck = await client.query(
        'SELECT stock FROM products WHERE id = $1',
        [item.id]
      );

      if (productCheck.rows.length === 0) {
        throw new Error('Product not found');
      }

      if (productCheck.rows[0].stock < item.qty) {
        throw new Error('Stock not enough');
      }

      // Insert transaction item
      await client.query(
        `INSERT INTO transaction_items
         (transaction_id, product_id, quantity, price)
         VALUES ($1,$2,$3,$4)`,
        [tx_id, item.id, item.qty, item.price]
      );

      // Reduce stock
      await client.query(
        `UPDATE products
         SET stock = stock - $1
         WHERE id = $2`,
        [item.qty, item.id]
      );
    }

    await client.query('COMMIT');

    res.json({
      message: 'Transaction success',
      transaction: tx.rows[0]
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;