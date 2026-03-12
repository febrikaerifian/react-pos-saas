require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const branchRoutes = require('./routes/branches');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');
const dashboardRoutes = require('./routes/dashboard');
const usersRoutes = require('./routes/users');
const stockRoutes = require('./routes/stock');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS untuk frontend Vercel
app.use(cors({
  origin: 'https://react-pos-saas.vercel.app', // frontend Vercel
  credentials: true,
}));

app.use(express.json());

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stock', stockRoutes);

app.get('/', (req, res) => res.send('POS Backend Online 🔥'));

// START SERVER
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
