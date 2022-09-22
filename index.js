const express = require('express');

const app = express();
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const bodyparser = require('body-parser')
//import routes
const authRoute = require('./routes/auth');
dotenv.config();

//connect to DB
mongoose.connect(process.env.DB_CONNECT,
    {useNewUrlParser: true},
    () =>{
        console.log('Connected to DB')
        })

//Middlewares
app.use(bodyparser.json());

//route middlewares
app.use('/api/user', authRoute)

app.listen(3000, () =>
{
    console.log('Server running');
})