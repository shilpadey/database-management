const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(express.json());


// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'hsrokz786',
  database: 'testdb',
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Serve HTML form to create tables
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Handle form submission to create tables
app.post('/create-table', (req, res) => {
  const tableName = req.body.tableName;
  const columns = Object.values(req.body).filter((val) => val !== tableName);


    const createTableQuery = `CREATE TABLE ${tableName} (id INT AUTO_INCREMENT PRIMARY KEY, ${columns.map((col) => `${col} VARCHAR(255)`).join(', ')})`;

  db.query(createTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating table:', err);
      res.send('Error creating table');
    } else {
      console.log('Table created successfully');
      res.redirect('/');
    }
  });
});

// Add these routes to the existing index.js file
app.get('/tables', (req, res) => {
  const showTablesQuery = 'SHOW TABLES';

  db.query(showTablesQuery, (err, result) => {
      if (err) {
          console.error('Error fetching tables:', err);
          res.send('Error fetching tables');
          return;
      }

      const tables = result.map(row => row[`Tables_in_${db.config.database}`]);
      res.json(tables);
  });
});

app.get('/table-details/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  const showColumnsQuery = `SHOW COLUMNS FROM ${tableName}`;

  db.query(showColumnsQuery, (err, result) => {
      if (err) {
          console.error('Error fetching columns:', err);
          res.send('Error fetching columns');
          return;
      }

      const columns = result.map(row => row.Field);
      res.json(columns);
  });
});

// Handle form submission to insert data
app.post('/insert-data/:tableName', (req, res) => {
  const tableName = req.params.tableName;

  const columns = req.body.columns;
  const values = req.body.values;


  // Construct placeholders for the values
  const valuePlaceholders = values.map(() => '?').join(', ');

  // Construct the dynamic INSERT INTO query with placeholders
  const insertDataQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${valuePlaceholders})`;

  console.log(insertDataQuery);

  // Execute the query with values
  db.query(insertDataQuery, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.json({ success: false, error: err.message });
    } else {
      console.log('Data inserted successfully');
      console.log(result);
      res.json({ success: true, message: 'Data inserted successfully' });

    }
  });
});

// Add this route to fetch data for a specific table
app.get('/fetch-data/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  const fetchDataQuery = `SELECT * FROM ${tableName}`;

  db.query(fetchDataQuery, (err, result) => {
      if (err) {
          console.error('Error fetching data:', err);
          res.json({ success: false, error: err.message });
      } else {
          const data = result;
          res.json(data);
      }
  });
});

// Handle form submission to delete data
app.post('/delete-data/:tableName/:id', (req, res) => {
    const tableName = req.params.tableName;
    const recordId = req.params.id;

    const deleteDataQuery = `DELETE FROM ${tableName} WHERE id = ?`;

    db.query(deleteDataQuery, [recordId], (err, result) => {
        if (err) {
            console.error('Error deleting data:', err);
            res.json({ success: false, error: err.message });
        } else {
            console.log('Data deleted successfully');
            res.json({ success: true, message: 'Data deleted successfully' });
        }
    });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
