require('dotenv').config();
const pool = require('./config/db');
const bcrypt = require('bcrypt');

const seedUsers = async () => {
  try {
    console.log('Seeding users...');

    // =============================
    // HASH PASSWORD
    // =============================
    const ownerPass = await bcrypt.hash('owner123', 10);
    const adminPass = await bcrypt.hash('admin123', 10);
    const kasirPass = await bcrypt.hash('kasir123', 10);

    // =============================
    // INSERT USERS
    // Ganti company_id & branch_id
    // sesuai yang ada di database kamu
    // =============================

    await pool.query(`
      INSERT INTO users 
      (company_id, branch_id, name, email, password, role)
      VALUES
      (1, 1, 'Budi Santoso', 'owner@majujaya.com', $1, 'owner'),
      (1, 1, 'Rina Manager', 'admin@majujaya.com', $2, 'admin'),
      (1, 1, 'Kasir Andi', 'kasir1@majujaya.com', $3, 'cashier'),
      (1, 2, 'Kasir Siti', 'kasir2@majujaya.com', $3, 'cashier')
    `, [ownerPass, adminPass, kasirPass]);

    console.log('✅ Users seeded successfully!');
    console.log('');
    console.log('Login Accounts:');
    console.log('Owner  : owner@majujaya.com / owner123');
    console.log('Admin  : admin@majujaya.com / admin123');
    console.log('Kasir1 : kasir1@majujaya.com / kasir123');
    console.log('Kasir2 : kasir2@majujaya.com / kasir123');

    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();