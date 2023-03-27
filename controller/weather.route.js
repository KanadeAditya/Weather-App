const mongoose = require('mongoose');
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {createClient} = require("redis")
const {UserModel} = require("../models/user.model.js")
const {authenticator} = require("../middleware/authentication.js")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const client = createClient({
    url: process.env.redis
});

let connection = async ()=>{
    await client.connect();
}

connection()

const weatherrouter = express.Router();

weatherrouter.use(authenticator)


weatherrouter.get("/:city",async (req,res)=>{
    let city = req.params.city;
    // res.send(city)
    try {
        let ifexist = await client.hGet("weather",city);
        if(ifexist!==null){
            res.send(JSON.parse(ifexist));
        }else{
            let data = await fetch(`${process.env.weather}&q=${city}&aqi=no`).then((res)=>res.json());
            client.hSet("weather",city,JSON.stringify(data))
            res.send(data)
        }
    } catch (error) {
        res.send({"msg":error.message});
    }
})

module.exports = {weatherrouter};

