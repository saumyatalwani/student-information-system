const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Student,Faculty, User} = require("../models/users")

const router = express.Router()

router.post('/register/user',async (req,res) => {
    try{
        const {email, password, firstName, lastName}=req.body
        const hashPassword = await bcrypt.hash(password,10);
        const stud = new User({
            email : email,
            password: hashPassword,
            role : 'user',
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
        })
        await stud.save();
        res.status(201).json({message: "User Created Successfully!"})
    } catch (err){
        console.log(err); //remove this at the end
        if(err.code == 11000){
            res.status(400).json({ error : 'Mail Already Exists'})
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
})

router.post('/login', async (req,res) => {
    try{
        const { email, password } = req.body

        const user = await User.findOne({email});
        
        if(!user){
            res.status(401).json({error : "User Not Found!"})
        }

        const hashPw = await bcrypt.hash(password,10);
        const pwdMatch = bcrypt.compare(user.password,hashPw)
        console.log(pwdMatch);

        if(!pwdMatch){
            res.status(401).json({error: "Incorrect Password"})
        }

        const userPayload = user.toObject();
        delete userPayload.password;

        const token = jwt.sign(userPayload,process.env.SECRET_KEY,{
            expiresIn: "1h"
        })

        res.status(200).json({token})
    } catch(err){
        res.status(500).json({error : err.message})
    }
})

module.exports = router