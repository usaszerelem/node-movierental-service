const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    },

    email: {
        type: String,
        unique: true,
        required: true,
        minlength: 10,
        maxlength: 255,
        lowercase: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            }
        }
    },

    password: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 1024,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            }
        }
    },

    isAdmin: {
        type: Boolean,
        default: false
    }
});

// -------------------------------------------------

userSchema.methods.generateAuthToken = function() {
    return jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
}

const User = mongoose.model('User', userSchema);

// -------------------------------------------------

function validate(user) {

    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(10).max(255).required().email(),
        password: Joi.string().min(4).max(255).required(),
        isAdmin: Joi.boolean()
    });

    return schema.validate(user);
}

module.exports.User = User;
module.exports.validate = validate;
