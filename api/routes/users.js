const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const { route } = require('./orders');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const { Router } = require('express');
const product = require('../models/product');


router.get('/', (req, res, next) =>{
    User.find() //finds all elements
    .select("_id email") //selects only specified fields
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            users: docs.map(doc =>{
                return{
                    name: doc.name,
                    _id: doc._id,
                    request:{
                        type: 'GET',
                        url: req.get('host')+'/users/' + doc.id
                    }      
                }
            })
        };
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        if(!user)
            return res.status(409).json({
                message: 'Already exists'
            }) //409 or 422 
        else{
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    return res.status(500).json(err); 
                }
                else{
                    const user = new User({
                        _id: new mongoose.Types.ObjectId,
                        email : req.body.email,
                        password : hash
                        })
                    user.save().then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: 'User created'
                        });
                    }).catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
                }
            })
        }
    })
});

router.delete('/:UserID', (req, res, next) => {    
    User.remove({_id: req.params.UserID})
    .exec()
    .then(result => {
        res.status(200).json({
            message: "User deleted!"
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
})

module.exports = router;    