const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const {Rental } = require('../models/rentals');
const { MovieReturn, validateReturn} =  require('../models/returns');
const validateObjectId = require('../middleware/validateObjectId');
const logger = require('../utils/logger');
const { Movie } = require('../models/movies');
const validate = require('../middleware/validate');

// -------------------------------------------------

router.post('/', [auth, validate(validateReturn)], async (req,res) => {
    const rental = await Rental.lookup( req.body.customerId, req.body.movieId);

    if (!rental) {
        return res.status(404).send('Rental not found');
    }

    if (rental.dateReturned) {
        return res.status(400).send('Rental already processed');
    }

    rental.return();
    await rental.save();

    // We now increase the number of movies in stock
    // The more efficient update way that I use when I remember
    await Movie.update({ _id: rental.movie._id }, {
        $inc: {numberInStock: 1 }
        });

    // Request successfully processed
    res.status(200).send(rental);
});

module.exports = router;
