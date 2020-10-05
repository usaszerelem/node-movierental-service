const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const { Genre, validateGenre } = require('../models/genres');
const logger = require('../utils/logger');

// -------------------------------------------------

router.delete('/:id', [auth, admin], async (req,res) => {
    logger.info('Delete genre request: ' + req.params.id );
    const genre = await Genre.findByIdAndRemove(req.params.id);

    if (!genre) {
        const message = `Genre with id ${req.params.id} was not found`;
        logger.warn(message);
        return res.status(404).send(message);
    }

    logger.debug('Genre Deleted:\n' + JSON.stringify(genre, null, 4));

    res.send(genre);
});

// -------------------------------------------------

router.put('/:id', [auth, admin], async(req,res) => {
    logger.info('Update genre request: ' + req.params.id );

    const { error } = validateGenre(req.body);

    if (error) {
        logger.error(error.details[0].message);
        return res.status(400).send(error.details[0].message);
    }

    const genre = await Genre.findByIdAndUpdate( req.params.id, {name: req.body.name }, { new: true } );

    if (!genre) {
        const message = `Genre with id ${req.params.id} was not found`;
        logger.warn(message);
        return res.status(404).send(message);
    }

    logger.info('Genre Updated:\n' + JSON.stringify(genre, null, 4));

    res.send(genre);
});

// -------------------------------------------------
/*
async function updateGenre(params) {

    // Query first approach where the genre is found, updated and then saved

    {
        const genre = await Genre.findById(parseInt(params.id));

        if (!genre) {
            return res.status(404).send(`Genre with id ${params.id} was not found`);
        }

        genre.name = params.name;
        return await Genre.save(genre);
    }

    // this update call uses the MongoDB update operators

    const genre = await Genre.findByIdAndUpdate(
        parseInt(params.id), {
            $set: {
                name: params.name
            }
        },
        { new: true}
    );

    if (!genre) {
        return res.status(404).send(`Genre with id ${params.id} was not found`);
    }

    return genre;
}
*/
// -------------------------------------------------

router.post('/', auth, async (req,res) => {
    logger.info('New genre request: ' + req.body.name );
    const { error } = validateGenre(req.body);
    
    if (error) {
        logger.error(error.details[0].message);
        return res.status(400).send(error.details[0].message);
    }

    let genre = new Genre({ name: req.body.name });  
    genre = await genre.save();

    logger.info('Genre created:\n' + JSON.stringify(genre, null, 4));

    res.send(genre);
});

// -------------------------------------------------

router.get('/', async (req,res) => {
    logger.info('Request to list all genres');
    const genres = await Genre.find().sort({name: 1 });
    logger.info("List of genres are:\n" + JSON.stringify(genres, null, 4));
    res.send(genres);
});

// -------------------------------------------------

router.get('/:id', validateObjectId, async (req,res) => {
    logger.info('Received ID:' + req.params.id);

    const genre = await Genre.findById(req.params.id);

    if (!genre) {
        const message = `Genre with id ${req.params.id} was not found`;
        logger.warn(message);
        return res.status(404).send(message);
    }

    logger.info('Returning genre:\n' + JSON.stringify(genre, null, 4));

    res.send(genre);
});

module.exports = router;