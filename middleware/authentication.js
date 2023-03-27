const mongoose = require('mongoose');
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {createClient} = require("redis");
const client = createClient({
    url: process.env.redis
  });

client.on('error', err => console.log('Redis Client Error', err));

client.connect();

const authenticator =  async (req,res,next)=>{
    let token = req.headers.authorization;
    if(token){
        let ifexist = await client.hGet("blacklist",token);
        console.log(ifexist)
        if(ifexist!==null){
            res.send({"msg":"User already logged out please login"});
        }else{
            try {
                jwt.verify(token, process.env.secretkey, (err, decoded)=>{
                   if(err){
                    res.send({msg:err})
                   }else{
                        req.body.email = decoded.email;
                        req.body.userId = decoded.userId;
                        next();
                   }
                });
            } catch (error) {
                res.send({"msg":error});
            }
        }
    }else{
        res.send({"msg":"Access Denied"});
    }
}

module.exports = {authenticator}