const Joi = require('joi');
const mongoose = require('mongoose');
const {genreSchema} = require('./genres');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            }
        }
    },

    genre: {
        type: genreSchema,
        required: true
    },

    numberInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 99
    },

    dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 99
    }

});

const Movie = mongoose.model('Movie', movieSchema);

// -------------------------------------------------

function validateMovie(movie) {
    
    const schema = Joi.object({
      title: Joi.string().min(5).max(50).required(),
      genreId: Joi.objectId().required(),
      numberInStock: Joi.number().min(0).required(),
      dailyRentalRate: Joi.number().min(0).required()
    });
  
    return schema.validate(movie);
  }

module.exports.Movie = Movie;
module.exports.movieSchema = movieSchema;
module.exports.validateMovie = validateMovie;
