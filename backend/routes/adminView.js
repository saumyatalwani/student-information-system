const mongoose = require('mongoose');
const express = require('express');
const {Faculty} = require('../models/users')
const {Lecture} = require('../models/class')

const router = express.Router();

router.get('/faculties',async(req,res)=>{
    try{
        const facs = await Faculty.find();

        res.status(200).json(facs);
    } catch(err){
        res.status(500).json({error : err.message})
    }
})

router.get('/courses',async(req,res)=>{
    try{
        const facs = await Lecture.find();
        console.log(facs);

        res.status(200).json(facs);
    } catch(err){
        res.status(500).json({error : err.message})
    }
})

module.exports=router