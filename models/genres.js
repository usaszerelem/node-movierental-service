const Joi = require('joi');
const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            }
        }
    }
});

const Genre = mongoose.model('Genre', genreSchema);

// -------------------------------------------------

function validateGenre(genre) {

    const schema = Joi.object({
        name: Joi.string().min(5).max(50).exist()
        //name: Joi.any().lowercase().allow('thriller','fiction','romance','horror')
    });

    return schema.validate(genre);
}

module.exports.Genre = Genre;
module.exports.genreSchema = genreSchema;
module.exports.validateGenre = validateGenre;
