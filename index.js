const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// create database
const db = new sqlite3.Database("contacts.db");

// create table
db.run(`
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT
)
`);

// API route
app.post("/contact", (req, res) => {
    const { name, email } = req.body;

    db.run(
        "INSERT INTO contacts (name, email) VALUES (?, ?)",
        [name, email],
        (err) => {
            if (err) {
                console.log(err);
                return res.json({ message: "Error saving ❌" });
            }
            res.json({ message: "Saved successfully ✅" });
        }
    );
});

// start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});