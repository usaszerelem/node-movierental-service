const express = require('express');
const { Movie, validateMovie } = require('../models/movies');
const { Genre } = require('../models/genres');
const router = express.Router();
const moviesLog = require('debug')('app:movies');

// -------------------------------------------------

router.get('/', async (req,res) => {
    try {
        const movies = await Movie.find().sort({title: 1 });
        res.send(movies);
    }
    catch(ex) {
        return res.status(404).send(edx.message);
    }
});

// -------------------------------------------------

router.get('/:id', async (req,res) => {
    try {
        moviesLog('Received Movie ID: ' + req.params.id);

        const movie = await Movie.findById(req.params.id);

        if (!movie)
            return res.status(404).send(`Movie with id ${req.params.id} was not found`);

        res.send(movie);
    }
    catch(ex) {
        return res.status(404).send(ex.message);
    }
});

// -------------------------------------------------

router.post('/', async (req,res) => {
    moviesLog('Movies POST Request', req.body);

    const { error } = validateMovie(req.body);

    if (error) {
        moviesLog('Validation failed', error.details[0].message);
        return res.status(400).send(error.details[0].message);
    }

    const genre = await Genre.findById(req.body.genreId);

    if (!genre) {
        const message = 'Did not find genre - ' + req.body.genreId;
        moviesLog(message);
        return res.status(400).send(message);
    }

    moviesLog('Creating Movie object');

    let movie = new Movie({
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });

    moviesLog('Saving Movie object', movie);

    movie = await movie.save();
    moviesLog('Movie object saved')

    res.send(movie);
});

// -------------------------------------------------

router.put('/:id', async(req,res) => {
    moviesLog('Validating movie object', req.body);
    const { error } = validateMovie(req.body);

    if (error) {
        moviesLog('Movie object validation failed', error.details[0].message);
        return res.status(400).send(error.details[0].message);
    }

    // Find the requested genre. This could be different from
    // the current genre.

    const genre = await Genre.findById(req.body.genreId);

    if (!genre) {
        moviesLog('Did not find genre - ' + req.body.genreId);
        return res.status(400).send(error.details[0].message);
    }

    moviesLog('Finding and updating movie');

    const movie = await Movie.findByIdAndUpdate(req.params.id,
        { 
            title: req.body.title,
            genre: {
                _id: genre._id,
                name: genre.name
            },
            numberInStock: req.body.numberInStock,
            dailyRentalRate: req.body.dailyRentalRate
        }, { new: true });

    if (!movie) {
        return res.status(404).send(`Movie with id ${params.id} was not found`);
    }

    moviesLog('Returning updated movie', movie);

    res.send(movie);
});

// -------------------------------------------------

router.delete('/:id', async (req,res) => {
    moviesLog('Deleting movie with ID - ' + req.params.id);

    const movie = await Movie.findByIdAndRemove(req.params.id);

    if (!movie) {
        moviesLog('Movie was not found');
        return res.status(404).send(`Movie with id ${id} was not found`);
    }

    moviesLog('Movie deleted');

    res.send(movie);
});

module.exports = router;
