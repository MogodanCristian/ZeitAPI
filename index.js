const express = require('express');

const app = express();
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const bodyparser = require('body-parser')
const cors = require('cors')
//import routes
const authRoute = require('./routes/auth');
const projectRoute = require('./routes/projectRoute');
const bucketRoute =  require('./routes/bucketRoute');
const taskRoute = require('./routes/taskRoute')
const userRoute = require('./routes/userRoute');
const messageRoute = require('./routes/messageRoute')
dotenv.config();

//connect to DB
mongoose.connect(process.env.DB_CONNECT,
    {useNewUrlParser: true},
    () =>{
        console.log('Connected to DB')
        })

//Middlewares
app.use(bodyparser.json());
app.use(cors())

//route middlewares
app.use('/api/auth', authRoute);
app.use('/api/projects/', projectRoute);
app.use('/api/buckets/',bucketRoute);
app.use('/api/tasks/', taskRoute);
app.use('/api/users/', userRoute);
app.use('/api/messages/', messageRoute);

app.listen(3000, () =>
{
    console.log('Server running');
})