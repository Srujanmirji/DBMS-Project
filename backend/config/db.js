const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'subscription_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initiateDB() {
  try {
    // Connect without a specific database to create it if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.MYSQLHOST || process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
      user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || ''
    });
    
    // Create DB if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQLDATABASE || process.env.DB_NAME || 'subscription_tracker'}\`;`);
    await connection.end();

    console.log('Database ' + (process.env.MYSQLDATABASE || process.env.DB_NAME || 'subscription_tracker') + ' is ready.');

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        preferences JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        service_name VARCHAR(255) NOT NULL,
        recurring_amount DECIMAL(10, 2) NOT NULL,
        billing_cycle ENUM('monthly', 'yearly', 'weekly') DEFAULT 'monthly',
        next_due_date DATE,
        status ENUM('active', 'paused', 'cancelled') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subscription_id INT NOT NULL,
        user_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables users, subscriptions, and payments verified/created successfully.');

    // ── Schema Migrations (ignoring duplicate column errors) ──
    const addColumn = async (table, definition) => {
      try {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
        console.log(`Successfully added column to ${table}: ${definition.split(' ')[0]}`);
      } catch (err) {
        // ER_DUP_FIELDNAME means the column is already there
        if (err.code !== 'ER_DUP_FIELDNAME') {
          console.error(`Error adding column to ${table}:`, err);
        }
      }
    };

    const modifyColumn = async (table, definition) => {
      try {
        await pool.query(`ALTER TABLE ${table} MODIFY COLUMN ${definition}`);
        console.log(`Successfully modified column in ${table}: ${definition.split(' ')[0]}`);
      } catch (err) {
        console.error(`Error modifying column in ${table}:`, err);
      }
    };

    await addColumn('users', 'name VARCHAR(255)');
    await addColumn('users', 'full_name VARCHAR(255)');
    await addColumn('users', 'phone VARCHAR(50)');
    await addColumn('users', 'monthly_budget DECIMAL(10,2)');
    await addColumn('users', "preferred_currency VARCHAR(10) DEFAULT 'INR'");
    await addColumn('users', 'profile_completed BOOLEAN DEFAULT FALSE');
    await addColumn('users', 'profile_picture VARCHAR(255)');
    await addColumn('users', 'reminders_enabled BOOLEAN DEFAULT TRUE');
    await addColumn('users', 'google_id VARCHAR(255) UNIQUE');
    await addColumn('users', 'avatar_url VARCHAR(500)');
    await addColumn('users', "provider VARCHAR(50) DEFAULT 'local'");
    
    await modifyColumn('users', 'profile_picture MEDIUMTEXT');
    await modifyColumn('users', 'password_hash VARCHAR(255) NULL');
    
    await addColumn('subscriptions', 'category VARCHAR(100)');
    // -- Phase 2 Structure Additions -- 
    await addColumn('subscriptions', 'is_trial BOOLEAN DEFAULT FALSE');
    await addColumn('subscriptions', 'trial_end_date DATE');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscription_audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subscription_id INT NOT NULL,
        action VARCHAR(50) NOT NULL,
        old_status VARCHAR(50),
        new_status VARCHAR(50),
        log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS shared_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subscription_id INT NOT NULL,
        shared_with_user_id INT NOT NULL,
        split_percentage DECIMAL(5, 2) NOT NULL DEFAULT 50.00,
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
        FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // -- Advanced DBMS Logics --
    console.log('Initializing Indexes, Triggers, Views, and Procedures...');

    // 1. Indexes
    const addIndex = async (table, indexName, columns) => {
      try {
        await pool.query(`CREATE INDEX ${indexName} ON ${table} (${columns})`);
      } catch (e) {
        if (e.code !== 'ER_DUP_KEYNAME') console.error(`Error adding index ${indexName}:`, e);
      }
    };
    await addIndex('subscriptions', 'idx_user_id', 'user_id');
    await addIndex('subscriptions', 'idx_next_due_date', 'next_due_date');
    await addIndex('subscriptions', 'idx_category', 'category');

    // 2. Triggers
    await pool.query(`DROP TRIGGER IF EXISTS trg_audit_subscriptions_update`);
    await pool.query(`
      CREATE TRIGGER trg_audit_subscriptions_update
      AFTER UPDATE ON subscriptions
      FOR EACH ROW
      BEGIN
        IF NEW.status != OLD.status THEN
          INSERT INTO subscription_audit_logs (subscription_id, action, old_status, new_status)
          VALUES (NEW.id, 'STATUS_CHANGE', OLD.status, NEW.status);
        END IF;
      END
    `);

    // 3. Views
    await pool.query(`
      CREATE OR REPLACE VIEW vw_monthly_summary AS
      SELECT 
        user_id, 
        SUM(recurring_amount) as total_monthly_spend,
        COUNT(id) as active_subscriptions
      FROM subscriptions
      WHERE status = 'active'
      GROUP BY user_id
    `);

    await pool.query(`
      CREATE OR REPLACE VIEW vw_due_this_week AS
      SELECT * FROM subscriptions 
      WHERE next_due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      AND status = 'active'
    `);

    // 4. Stored Procedures
    await pool.query(`DROP PROCEDURE IF EXISTS sp_cancel_subscription`);
    await pool.query(`
      CREATE PROCEDURE sp_cancel_subscription(IN sub_id INT)
      BEGIN
        UPDATE subscriptions 
        SET status = 'cancelled' 
        WHERE id = sub_id;
      END
    `);

    await pool.query(`DROP PROCEDURE IF EXISTS sp_get_user_spending_report`);
    await pool.query(`
      CREATE PROCEDURE sp_get_user_spending_report(IN p_user_id INT)
      BEGIN
        SELECT category, SUM(recurring_amount) as total_spent
        FROM subscriptions
        WHERE user_id = p_user_id AND status = 'active'
        GROUP BY category
        ORDER BY total_spent DESC;
      END
    `);
    console.log('DBMS logics initialized successfully.');

  } catch (error) {
    console.error('Database setup failed:', error);
  }
}

initiateDB();

module.exports = pool;
