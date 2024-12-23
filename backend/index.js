require('dotenv').config();
const express = require('express')
const cors = require('cors')
const app = express();
const mysql = require('mysql2')

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://<Frontend_LB_DNS>",  // Use your frontend LB DNS
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

const PORT = process.env.PORT || 80;  // Listen on LB port
// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
    if(!err){
        console.log("Connected to database successfully");
        
    }else{
        console.log(err);
        
    }
})

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).send("Backend is healthy");
});

app.post('/new-task', (req, res) => {
    console.log(req.body);
    const q  = 'insert into todos (task, createdAt, status) values (?, ?, ?)';
    db.query(q, [req.body.task, new Date(), 'active'], (err, result) => {
        if(err){
            console.log('failed to store');
            
        }
        else{
            console.log('todo saved');
            const updatedTasks = 'select * from todos'
            db.query(updatedTasks, (error, newList) => {
                res.send(newList)
            })
            
        }
    })
    
})

app.get('/read-tasks', (req, res) => {
    const q = 'select * from todos';
    db.query(q, (err, result) => {
        if(err){
            console.log("failed to read tasks");
            
        }
        else{
            console.log("got tasks successfully from db");
            res.send(result)
            
            
        }
    })
})

app.post('/update-task', (req, res) => {
    console.log(req.body);
    const q = 'update todos set task = ? where id = ?'
    db.query(q, [req.body.task, req.body.updateId], (err, result) => {
        if(err) {
            console.log('failed to update');
            
        }
        else{
            console.log('updated');
            db.query('select* from todos', (e, r) => {
                if(e){
                    console.log(e);
                    
                }
                else{
                    res.send(r)
                }
            })
            
        }
    })
    
})

app.post('/delete-task', (req, res) => {
    const q = 'delete from todos where id = ?';
    db.query(q, [req.body.id], (err, result) => {
        if(err){
            console.log('Failed to delete');
            
        }else{
            console.log('Deleted successfully');
            db.query('select * from todos', (e, newList) => {
                res.send(newList);
            })
        }
    })
})

app.post('/complete-task', (req, res) => {
    console.log(req.body);
    
    const q = 'update todos set status = ? where id = ?'
    db.query(q, ['completed', req.body.id], (err, result) => {
        if(result){

            
            db.query('select * from todos', (e, newList) => {
                res.send(newList)
            })
        }

    })
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});
