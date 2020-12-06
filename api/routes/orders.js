const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order.js');
const Product = require('../models/product.js');

router.get('/', (req,res,next) => {
    Order
    .find()
    .select('product quantity id')
    .populate('product')
    .exec()
    .then(result => {
        res.status(201).json(result)
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        })
    })
});

router.post('/', (req,res,next) => {
    Product.findById(req.body.productID)
    .then(product => {
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            product: req.body.productID,
            quantity: req.body.quantity
        });
        return order.save()
    })    
    .then(result => {
        console.log(result),
        res.status(201).json({
            message: 'Order placed successfully',
            createdOrder: {
                _id: result._id,
                productID: result.product,
                quantity: result.quantity,
                request:{
                    type: 'POST',
                    url: req.get('host')+'/products/'+ result._id
                }
            }
        })  
    })
});

router.get("/:orderID", (req, res, next) => {
    Order.findById(req.params.orderID)
    .then(result => {
        console.log(result),
        res.status(201).json({
            message: 'Order found',
            createdOrder: {
                _id: result._id,
                productID: result.product,
                quantity: result.quantity,
                request:{
                    type: 'GET',
                    url: req.get('host')+'/products/'+ req.params.orderID
                } 
            }
        })  
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
});


router.delete("/:orderID", (req, res, next) => {
    Order.remove({_id: req.params.orderID})
    .exec()
    .then(result => {
        res.status(200).json({
            message: "Order deleted",
            request:{
                type: "POST",
                url: req.get('host')+'/products/'+ req.params.orderID,
                body: {productID: "Deleted ID", quantity: 'Number'}
            }
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
})
module.exports = router;