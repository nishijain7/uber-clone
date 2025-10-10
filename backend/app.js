const dotenv=require('dotenv');

const cors=require('cors');
dotenv.config();

const express=require('express');
const connectToDb=require('./db/db');
connectToDb();

const app=express();
const userRoutes = require('./routes/user.routes');

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/',(req,res)=>{
    res.send('Hello World!');
});

// Mount user routes at /users -> POST /users/register
app.use('/users', userRoutes);

module.exports=app;