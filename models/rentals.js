const mongoose = require('mongoose');
const Joi = require('joi');
const moment = require('moment');

//const {customerSchema, validateCustomer} = require('./customers');
//const {movieSchema, validateMovie} = require('./movies');

const rentalSchema = new mongoose.Schema({
    // Using custom schema instead of reusing. Customer can have many properties
    // and we do not want all these properties inside this object. Just those
    // that we want to display.

    customer: {
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50
            },
            isGold: {
                type: Boolean,
                default: false
            },
            phone: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50
            }
        })
    },

    movie: {
        type: new mongoose.Schema({
            title: {
                type: String,
                required: true,
                trim: true,
                minlength: 5,
                maxlength: 50
            },
            dailyRentalRate: {
                type: Number,
                required: true,
                min: 0,
                max: 99
            }
        })
    },

    dateOut: {
        type: Date,
        required: true,
        default: Date.now
    },

    dateReturned: {
        type: Date
    },

    rentalFee: {
        type: Number,
        min: 0
    }
});

// -------------------------------------------------
// Static functions to make usage more intuitive

rentalSchema.statics.lookup = function(customerId, movieId) {
    return this.findOne({
        'customer._id': customerId,
        'movie._id': movieId
        });
}

// -------------------------------------------------
// Instance function to encapsulate data and functionality

rentalSchema.methods.return = function() {
    this.dateReturned = new Date();

    const rentalDays = moment().diff(this.dateOut, 'days');

    // We add 1 day to the rentalDays because even if the person
    // rented the movie for a few hours, this person should pay
    // at least one rental day. Also if he returns the movie 1 day and
    // one minute after the rental, this counts as two days.

    this.rentalFee = (rentalDays + 1) * this.movie.dailyRentalRate;
}

const Rental = mongoose.model('Rental', rentalSchema);

// -------------------------------------------------

function validateRental(rental) {
    
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    });
  
    return schema.validate(rental);
  }

module.exports.Rental = Rental;
module.exports.rentalSchema = rentalSchema;
module.exports.validateRental = validateRental;
