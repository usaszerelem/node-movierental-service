const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Fawn = require('fawn');
const {Rental, validateRental } = require('../models/rentals');
const { Customer } = require('../models/customers');
const { Movie } = require('../models/movies');
const router = express.Router();
const rentalLog = require('debug')('app:rentals');

// -------------------------------------------------
// Simplifies implementation of 2 phase commits.
// This is needed for atomic transactions when
// saving rentals.

Fawn.init(mongoose);

// -------------------------------------------------

router.get('/', auth, async (req,res) => {
    const rentals = await Rental.find().sort('-dateOut');
    res.send(rentals);
});

// -------------------------------------------------

router.get('/:id', auth, async (req,res) => {
    if (req.query.customerId) {
        // find() returns an array
        const rental = await Rental.find(
            { 'customer._id': { $equ: req.query.customerId} }
        );

        if (!rental)
            return res.status(404).send(`Rental with id ${req.params.id} was not found`);

        res.send(rental);
    }
    else {
        // Assume it is a rental ID
        rentalLog('Received Rental ID: ' + req.params.id);

        const rental = await Rental.findById(req.params.id);

        if (!rental)
            return res.status(404).send(`Rental with id ${req.params.id} was not found`);

        res.send(rental);
    }
});

// -------------------------------------------------

router.post('/', auth, async (req,res) => {
    rentalLog('Rental POST Request', req.body);

    const { error } = validateRental(req.body);

    if (error) {
        rentalLog('Bad POST request', error.details[0].message);
        return res.status(400).send(error.details[0].message);
    }

    rentalLog('Finding rental customer');
    const customer = await Customer.findById(req.body.customerId);

    if (!customer) {
        const message = 'Did not find customerID - ' + req.body.customerId;
        rentalLog(message);
        return res.status(400).send(message);
    }

    rentalLog('Customer name:', customer.name);

    const movie = await Movie.findById(req.body.movieId);

    if (!movie) {
        const message = 'Did not find movieID - ' + req.body.movieId;
        rentalLog(message);
        return res.status(400).send(message);
    }

    rentalLog('Found movie:', movie);

    if (movie.numberInStock === 0) {
        const message = 'Movie not in stock - ' + req.body.movieId;
        rentalLog(message);
        return res.status(400).send(message);
    }

    rentalLog('Creating Rental object');

    let rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone,
            isGold: customer.isGold
        },

        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    });

    rentalLog('Rental object created');

    // All these operations are like a transaction. All must
    // succeed in order for the data to be saved

    new Fawn.Task()
        .save('rentals', rental)
        .update('movies', { _id: movie._id }, {
            $inc: { numberInStock: -1}
        })
        .run();

    rentalLog('Rental object saved');
    res.send(rental);
});

module.exports = router;
