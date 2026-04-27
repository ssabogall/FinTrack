const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./database.sqlite');

const password = bcrypt.hashSync('123456', 10);

db.run(
  `INSERT INTO user (name, email, password, role, createdAt, updatedAt) 
   VALUES (?, ?, ?, ?, ?, ?)`,
  ['Santiago', 'ssabogall@gmail.com', password, 'user', new Date(), new Date()],
  function(err) {
    if (err) console.error('Error:', err.message);
    else console.log('✓ Usuario creado con ID:', this.lastID);
    db.close();
  }
);