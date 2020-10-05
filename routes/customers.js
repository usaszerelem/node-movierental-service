const express = require('express');
const auth = require('../middleware/auth');
const { Customer, validateCustomer } = require('../models/customers');
const router = express.Router();
const custLog = require('debug')('app:customers');

// -------------------------------------------------

router.delete('/:id', auth, async (req,res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);

    if (!customer) {
        return res.status(404).send(`Customer with id ${id} was not found`);
    }

    res.send(customer);
});

// -------------------------------------------------

router.put('/:id', auth, async(req,res) => {
    const { error } = validateCustomer(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    custLog('Received customer data', req.body);

    const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                phone: req.body.phone,
                isGold: req.body.isGold
            },
            { new: true }
        );

    if (!customer) {
        return res.status(404).send(`Customer with id ${params.id} was not found`);
    }

    custLog('Customer created');
    res.send(customer);
});

// -------------------------------------------------

router.post('/', auth, async (req,res) => {
    const { error } = validateCustomer(req.body);

    if (error) {
        custLog('Bad validation');
        return res.status(400).send(error.details[0].message);
    }

    let customer = new Customer(
        {
            name: req.body.name,
            phone: req.body.phone,
            isGold: req.body.isGold
        });

    customer = await customer.save();

    custLog('Customer', customer);

    res.send(customer);
});

// -------------------------------------------------

router.get('/', auth, async (req,res) => {
    const customer = await Customer.find().sort({name: 1 });
    res.send(customer);
});

// -------------------------------------------------

router.get('/:id', auth, async (req,res) => {
    custLog('Received ID: ' + req.params.id);

    const customer = await Customer.findById(req.params.id);

    if (!customer)
        return res.status(404).send(`Customer with id ${req.params.id} was not found`);

    res.send(customer);
});

module.exports = router;