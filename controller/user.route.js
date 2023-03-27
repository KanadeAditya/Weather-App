const mongoose = require('mongoose');
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {createClient} = require("redis")
const {UserModel} = require("../models/user.model.js")

const client = createClient({
    url: process.env.redis
});

client.on('error', err => console.log('Redis Client Error', err));



const userrouter = express.Router();

userrouter.post("/register",async (req,res)=>{
    let {name, email , password} = req.body;
    if(!name || !email || !password){
        res.send({"msg":"Please fill out all the details"});
    }else{
        let ifexist = await UserModel.find({email});
        if(ifexist.length){
            res.send({"msg":"User already exists"});
        }else{
            try {
                bcrypt.hash(password, 8 , async(err,hash)=>{
                    if(err){
                        res.send({"msg":err});
                    }else{
                        const newuser = new UserModel({name, email , password:hash});
                        await newuser.save()
                        res.send({"msg":"User has been registered"})
                    }
                })
            } catch (error) {
                res.send({"msg":error});
            }
        }
    }
})

userrouter.post("/login",async (req,res)=>{
    let {email , password} = req.body;
    try {
        let ifexist = await UserModel.find({email});
        if(ifexist.length){
            let user = ifexist[0];
            bcrypt.compare(password,user.password,(err,result)=>{
                if(err){
                    res.send({"msg":err});
                }else{
                    if(result){
                        let token = jwt.sign({email,userId : user._id}, process.env.secretkey, { expiresIn: 60 * 30 });
                        res.send({"msg":"Logged in  successfully",token})
                    }else{
                        res.send({"msg":"Wrong password"})
                    }
                }
            })
        }else{
            res.send({"msg":"Wrong email"})
        }
    } catch (error) {
        res.send({"msg":error});
    }
})

userrouter.post("/logout",async(req,res)=>{
    try {
        let token = req.headers.authorization;
        if(token){
            client.hSet("blacklist",`${token}`,"");
            res.send({"msg":"User Logged out"});
        }else{
            res.send("please provide the token");
        }
    } catch (error) {
        res.send({"msg":error});
    }
})

module.exports = {userrouter,client};