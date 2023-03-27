const express = require("express");
const mongoose = require('mongoose');
require("dotenv").config();
const cors = require("cors");

const {connection} = require("./db.js")
const {userrouter,client} = require("./controller/user.route.js")
const {weatherrouter} = require("./controller/weather.route.js")
const  winston = require('winston')
const  expressWinston = require('express-winston');


const app = express();


app.use(cors());
app.use(express.json());
app.use(expressWinston.logger({
    transports: [
      new winston.transports.Console({
        level:"error",
        json:true
      }),
      new winston.transports.File({
        level:"error",
        filename:"logs.json"
      })
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
  }))

app.use("/users",userrouter)
app.use("/weather",weatherrouter);

app.get("/",(req,res)=>{
    res.send("HOME PAGE");
})



app.listen(process.env.port,async()=>{
    try {
        await connection;
        await client.connect();
        console.log({msg:`Server is live at ${process.env.port} and connected to DB`});
    } catch (error) {
        console.log({msg:error});
    }
});