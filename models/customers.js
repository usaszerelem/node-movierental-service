const Joi = require('joi');
const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
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

    phone: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 20,
        validate: {
            validator: function(v) {
                 return v && v.length > 0;
            }
        }
    },

    isGold: {
        type: Boolean,
        default: false
        }
    }
);

const Customer = mongoose.model('Customer', customerSchema );

// -------------------------------------------------

function validateCustomer(body) {

    const schema = Joi.object({
        name: Joi.string().min(5).max(50).exist(),
        phone: Joi.string().min(10).max(20).exist(),
        isGold: Joi.boolean()
    });

    return schema.validate(body);
}

module.exports.Customer = Customer;
module.exports.customerSchema = customerSchema;
module.exports.validateCustomer = validateCustomer;
