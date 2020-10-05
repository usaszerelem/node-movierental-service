const request = require('supertest');
const mongoose = require('mongoose');
const moment = require('moment');
const { MovieReturn, validateReturn} =  require('../../models/returns');
const {Rental} = require('../../models/rentals');
const {User} = require('../../models/users');
const { Movie } = require('../../models/movies');

describe('/api/returns', () => {
    let server;
    let customerId;
    let movie;
    let movieId;
    let rental;
    let movieReturn;
    let authToken;
    //let rentalPayload;

    const exec = () => {
        return request(server)
            .post('/api/returns/')
            .set('x-auth-token', authToken)
            .send({ customerId, movieId });
    };

    beforeEach( async () => {
        server = require('../../index');
        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();

        movie = new Movie({
            _id: movieId,
            title: '12345',
            dailyRentalRate: 2,
            genre: {name: '12345' },
            numberInStock: 10
        });

        rental = new Rental({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '12345'
            },

            movie: {
                _id: movieId,
                title: '12345',
                dailyRentalRate: 2
            }
        });

        await movie.save();
        await rental.save();

        authToken = new User().generateAuthToken();
    });

    afterEach( async () => {
        // Removes all Rental documents
        await Rental.deleteMany({});
        await Movie.deleteMany({});
        await server.close();
    });
/*
    describe('GET /', () => {
        it('should return 401 if client is not logged in', async () => {
            authToken = '';

            const res = await request(server)
                .get('/api/returns/' + rental._id)
                .set('x-auth-token', authToken);

            expect(res.status).toBe(401);
        });
    });
*/
    describe('POST /', () => {
        it('should return 401 if client is not logged in', async () => {
            authToken = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 400 if customerId is not provided', async () => {
            customerId = '';
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if movieId is not provided', async () => {
            movieId = '';
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 404 if no rental found for this customer/movie', async () => {
            movieId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should return 400 if rental already processed', async () => {
            rental.dateReturned = new Date();
            await rental.save();

            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
        });

        it('should set the return date', async () => {
            const res = await exec();
            const rentalInDb = await Rental.findById(rental._id);
            const diff = new Date() - rentalInDb.dateReturned;
            expect(diff).toBeLessThan(10 * 1000);
        });

        it('should calculate the rental fee', async () => {
            rental.dateOut = moment().add(-6, 'days').add(-14, 'hours').toDate();

            await rental.save();

            const res = await exec();
            const rentalInDb = await Rental.findById(rental._id);
            const rentalHours = moment(rentalInDb.dateReturned).diff(rental.dateOut, 'hours');

            expect(rentalInDb.rentalFee).toBe(14);
        });

        it('should increase the movie stock', async () => {
            const res = await exec();
            const movieInDb = await Movie.findById(movieId);
            
            expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
        });

        it('should return the rental object in the response', async () => {
            const res = await exec();
            const rentalInDb = await Rental.findById(rental._id);

            /*
            expect(res.body).toHaveProperty('customer');
            expect(res.body).toHaveProperty('movie');
            expect(res.body).toHaveProperty('dateOut');
            expect(res.body).toHaveProperty('dateReturned');
            expect(res.body).toHaveProperty('rentalFee');
            */
           
            // To remove repetitive source code lines, create an array and 
            // check that the array contains the JSON properties

            expect(Object.keys(res.body)).toEqual(
                expect.arrayContaining(['dateOut', 'dateReturned', 'rentalFee', 'customer', 'movie'])
            );
        });
    });
});
