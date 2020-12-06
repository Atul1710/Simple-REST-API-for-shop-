const express = require('express');
const { response } = require('../../app');
const { route } = require('../../app');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads');
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    //reject file
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
    cb(null, false);
    cb(null,true)
}

const upload = multer({storage: storage, limits: {
    filesize: 1024 * 1024 * 5
},
fileFilter: fileFilter
}); 


const Product = require('../models/product');

router.get('/', (req, res, next) =>{
    Product.find() //finds all elements
    .select("name price _id productImage") //selects only specified fields
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs.map(doc =>{
                return{
                    name: doc.name,
                    price: doc.price,
                    _id: doc._id,
                    productImage: doc.productImage,
                    request:{
                        type: 'GET',
                        url: req.get('host')+'/products/' + doc.id
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

router.post('/', upload.single('productImage'),(req, res, next) =>{
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId,
        name: req.body.name,
        price : req.body.price,
        productImage: req.file.path
    });

    product.save().then(result=>{
        console.log(result); 
        res.status(201).json({
            message: 'Created product successfully',
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                request:{
                    type: 'GET',
                    url: req.get('host')+'/products/'+ result._id
                }
            } 
    });
    })
});

router.patch("/:productID", (req, res, next) => {
 
    const id = req.params.productID;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }

    Product.update({_id: id}, {$set: updateOps})
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});  

router.get('/:productID', (req, res, next) => {
    const id = req.params.productID;

    Product.findById(id)
    .select("name price _id productImage")
    .exec()
    .then(doc => {
        res.status(201).json({
            message: "Product is available",
            products:{
                name: doc.name,
                price: doc.price,
                _id: doc._id,
                request:{
                    type: 'GET',
                    url: req.get('host')+'/products/' + doc._id 
                }
            }            
        })
        // if(doc){
        //     res.status(201).json(response);
        //     console.log("From database",doc);
        // }
        // else{
        //     res.status(404).json({message: "No valid entry"});
        // }
    })  
    .catch(err =>{
    console.log(err);    
    res.status(500).json({error: err});
    });
});


router.delete('/:productID', (req, res, next) => {
    const id = req.params.productID;

    Product.remove({_id: id})
    .exec()
    .then(doc => {
        if(doc){
            res.status(200).json(doc);
        }
        else{
            res.status(404).json({message: "No valid entry"});
        }
    })
    .catch(err => ({
        error: err
    })
    );
});
module.exports = router;    