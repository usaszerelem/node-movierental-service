const mongoose = require('mongoose');
const Joi = require('joi');

const returnSchema = new mongoose.Schema({
    customerId: {
        type: Number,
        required: true,
        min: 0,
        max: 99
    },
    
    movieId: {
        type: Number,
        required: true,
        min: 0,
        max: 99
    }
});

const MovieReturn = mongoose.model('MovieReturn', returnSchema);

// -------------------------------------------------

function validateReturn(movieReturn) {
    
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    });
  
    return schema.validate(movieReturn);
  }

module.exports.MovieReturn = MovieReturn;
module.exports.returnSchema = returnSchema;
module.exports.validateReturn = validateReturn;
