const express = require('express');
const router = express.Router();
//const { render } = require('pug');

router.get('/', (req,res) => {
    res.render('index', {
        title: 'Movie Rental',
        message: "Martin's Movie Rental"
    });
});

module.exports = router;
