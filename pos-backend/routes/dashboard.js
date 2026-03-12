const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

/* =========================
   HELPER FILTER BUILDER
========================= */
const buildFilter = (req) => {
  const { branch_id, start_date, end_date } = req.query;
  const user = req.user;

  let conditions = [];
  let values = [];
  let index = 1;

  /* =========================
     🔐 ROLE BASED BRANCH
  ========================= */

  // 1️⃣ Cashier selalu terkunci branch sendiri
  if (user.role === 'cashier') {
    conditions.push(`u.branch_id = $${index++}`);
    values.push(user.branch_id);
  }

  // 2️⃣ Admin / Owner → boleh filter manual
  else if (branch_id && branch_id !== 'null' && branch_id !== '') {
    conditions.push(`u.branch_id = $${index++}`);
    values.push(branch_id);
  }

  /* =========================
     📅 DATE FILTER
  ========================= */

  if (start_date && end_date) {
    conditions.push(`DATE(t.created_at) BETWEEN $${index++} AND $${index++}`);
    values.push(start_date, end_date);
  }

  const where =
    conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

  return { where, values };
};




/* =========================
   1️⃣ STATS + GROWTH
========================= */
router.get('/stats', auth, async (req, res) => {
  try {

    const { where, values } = buildFilter(req);

    const salesQuery = `
      SELECT COALESCE(SUM(t.total),0) AS total
      FROM transactions t
      LEFT JOIN users u ON u.id = t.user_id
      ${where}
    `;

    const transactionQuery = `
      SELECT COUNT(*) 
      FROM transactions t
      LEFT JOIN users u ON u.id = t.user_id
      ${where}
    `;

    const productQuery = `
      SELECT COUNT(*) FROM products
    `;

    const [sales, transactions, products] = await Promise.all([
      pool.query(salesQuery, values),
      pool.query(transactionQuery, values),
      pool.query(productQuery)
    ]);

    /* ========= GROWTH VS YESTERDAY ========= */

    const yesterdayQuery = `
      SELECT COALESCE(SUM(t.total),0) AS total
      FROM transactions t
      LEFT JOIN users u ON u.id = t.user_id
      WHERE DATE(t.created_at) = CURRENT_DATE - INTERVAL '1 day'
    `;

    const yesterday = await pool.query(yesterdayQuery);
    const todayTotal = parseFloat(sales.rows[0].total);
    const yesterdayTotal = parseFloat(yesterday.rows[0].total);

    let growth = 0;
    if (yesterdayTotal > 0) {
      growth = ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
    }

    res.json({
      totalSales: parseFloat(todayTotal),
      totalTransactions: parseInt(transactions.rows[0].count),
      totalProducts: parseInt(products.rows[0].count),
      growthPercentage: parseFloat(growth.toFixed(2))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});





/* =========================
   2️⃣ SALES CHART (CUSTOM RANGE)
========================= */
router.get('/sales-chart', auth, async (req, res) => {
  try {

    const { where, values } = buildFilter(req);

    const query = `
      SELECT 
        DATE(t.created_at) as date,
        SUM(t.total) AS total
      FROM transactions t
      LEFT JOIN users u ON u.id = t.user_id
      ${where}
      GROUP BY DATE(t.created_at)
      ORDER BY DATE(t.created_at)
    `;

    const result = await pool.query(query, values);

    const labels = result.rows.map(r => r.date);
    const data = result.rows.map(r => parseFloat(r.total));

    res.json({ labels, data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});





/* =========================
   3️⃣ RECENT TRANSACTIONS
========================= */
router.get('/recent-transactions', auth, async (req, res) => {
  try {

    const { where, values } = buildFilter(req);

    const query = `
      SELECT 
        t.invoice_number,
        t.total,
        t.created_at,
        u.name AS cashier_name,
        b.name as branch_id
      FROM transactions t
       JOIN users u ON u.id = t.user_id
       JOIN branches b ON b.id = u.branch_id
      ${where}
      ORDER BY t.created_at DESC
      LIMIT 5
    `;

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});





/* =========================
   4️⃣ TOP PRODUCTS
========================= */
router.get('/top-products', auth, async (req, res) => {
  try {

    const { branch_id, start_date, end_date } = req.query;
    const user = req.user;

    let conditions = [];
    let values = [];
    let index = 1;

    if (user.role === 'cashier') {
      conditions.push(`u.branch_id = $${index++}`);
      values.push(user.branch_id);
    } else if (branch_id) {
      conditions.push(`u.branch_id = $${index++}`);
      values.push(branch_id);
    }

    if (start_date && end_date) {
      conditions.push(`DATE(t.created_at) BETWEEN $${index++} AND $${index++}`);
      values.push(start_date, end_date);
    }

    const where =
      conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    const query = `
      SELECT 
        p.name,
        SUM(td.quantity) as total_sold
      FROM transaction_items td
      JOIN transactions t ON t.id = td.transaction_id
      JOIN products p ON p.id = td.product_id
      LEFT JOIN users u ON u.id = t.user_id
      ${where}
      GROUP BY p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `;

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;