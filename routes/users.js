const express = require('express');
const auth = require('../middleware/auth');
const _ = require('lodash');
const { User, validate } = require('../models/users');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const userLog = require('debug')('app:users');

// -------------------------------------------------

router.delete('/:id', auth, async (req,res) => {
    userLog('User delete received');
    const user = await User.findByIdAndRemove(req.params.id);

    if (!user) {
        userLog(`User with id ${id} was not found`);
        return res.status(404).send(`User with id ${id} was not found`);
    }

    userLog('User deleted');
    res.send(user);
});

// -------------------------------------------------

router.put('/:id', auth, async(req,res) => {
    userLog('Update user received');
    const { error } = validate(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    userLog('Received data', req.body);

    const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            },
            { new: true }
        );

    if (!user) {
        return res.status(404).send(`User with id ${params.id} was not found`);
    }

    userLog('User updated');
    res.send(customeuserr);
});

// -------------------------------------------------

router.post('/', auth, async (req,res) => {
    userLog('User Create - Received', req.body);

    const { error } = validate(req.body);
    
    if (error) {
        userLog('Bad validation');
        return res.status(400).send(error.details[0].message);
    }

    // There can only be one user with the same email
    // registered. Check if there is already a user
    // that uses this same email.

    let user = await User.findOne({ email: req.body.email });

    if (user) {
        return res.status(400).send('User already registered');
    }

    user = new User( _.pick(req.body, ['name', 'email', 'password', 'isAdmin']));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    user = await user.save();

    userLog('User created', user);

    const userMinData = _.pick(user, ['_id', 'name', 'email', 'isAdmin'])
    userLog('Pick returned: ', userMinData)

    res.header('x-auth-token', user.generateAuthToken()).send(userMinData);
});

// -------------------------------------------------
// If we get here we have a user request ID object
// and the user is authorized to obtain information
// about itself

router.get('/me', auth, async (req,res) => {
    userLog('Received ID: ' + req.user._id);

    // Exclude password and possible other unwanted information
    // from the returned information

    const user = await User.findById(req.user._id).select('-password');

    if (!user)
        return res.status(404).send(`User with id ${req.params.id} was not found`);

    userLog('Returning user:', user);
    res.send(user);
});

// -------------------------------------------------

router.get('/', auth, async (req,res) => {
    const user = await User.find().sort({name: 1});
    res.send(user);
});

// -------------------------------------------------
// This method is only available to administrators
// The requestor has been authorized by the time
// this call is made. What we need to do is to
// validate whether the current logged in user
// is an administrator.

router.get('/:id', auth, async (req,res) => {
    userLog('Received ID: ' + req.params.id);

    const user = await User.findById(req.params.id);

    if (!user)
        return res.status(404).send(`User with id ${req.params.id} was not found`);

    res.send(user);
});

module.exports = router;