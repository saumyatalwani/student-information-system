const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Student,Faculty, User} = require("../models/users")

const router = express.Router()

router.post('/register/student',async (req,res) => {
    try{
        const {email, password, rollNo, division, firstName, lastName}=req.body
        const hashPassword = await bcrypt.hash(password,10);
        const stud = new Student({
            email : email,
            password: hashPassword,
            rollNo : rollNo,
            division: division,
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
        })
        await stud.save();
        res.status(201).json({message: "Student Created Successfully!"})
    } catch (err){
        console.log(err); //remove this at the end
        if(err.code == 11000){
            res.status(400).json({ error : 'Mail Already Exists'})
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
})

router.post('/register/parent',async (req,res) => {
    try{
        const {email, password, rollNo, division, firstName, lastName}=req.body
        const hashPassword = await bcrypt.hash(password,10);
        const stud = new Student({
            email : email,
            password: hashPassword,
            rollNo : rollNo,
            division: division,
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
        })
        await stud.save();
        res.status(201).json({message: "Parent Created Successfully!"})
    } catch (err){
        console.log(err); //remove this at the end
        if(err.code == 11000){
            res.status(400).json({ error : 'Mail Already Exists'})
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
})

router.post('/register/faculty',async (req,res) => {
    try{
        const {email, password, firstName, lastName, prefix}=req.body
        const hashPassword = await bcrypt.hash(password,10);
        const faculty = new Faculty({
            email : email,
            password: hashPassword,
            ...(prefix && { prefix }),
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
        })
        await faculty.save();
        res.status(201).json({message: "Faculty Created Successfully!"})
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