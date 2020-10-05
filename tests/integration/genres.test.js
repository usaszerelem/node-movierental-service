const request = require('supertest');
const {Genre} = require('../../models/genres');
const {User} = require('../../models/users');
const mongoose = require('mongoose');

let server;

describe('/api/genres', () =>{
    beforeEach(() => { server = require('../../index'); });
    afterEach( async () => {
        // Removes all Genre documents
        await Genre.deleteMany({});
        await server.close();
    });

    describe('GET /', () => {
        it('should return all genres', async () => {
            // We add multiple documents to MongoDB test database
            // that we are going to query for.
            await Genre.collection.insertMany([
                { name: 'genre1' },
                { name: 'genre2' }
            ]);

            const res = await request(server).get('/api/genres');

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some( g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.some( g => g.name === 'genre2')).toBeTruthy();
        });
    });

    describe('GET /:Id', () => {
        let authToken;

        beforeEach(() => {
            authToken = new User().generateAuthToken();
        });

        it('should return a genre if valid id is passed', async () => {
            const genre = new Genre({ name: 'genre1' });
            await genre.save();

            const res = await request(server)
                .get('/api/genres/' + genre._id)
                .set('x-auth-token', authToken);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        });

        it('should should return 404 if invalid id is passed', async () => {
            //var id = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
            //const res = await request(server).get('/api/genres/' + id);

            const res = await request(server)
                .get('/api/genres/1')
                .set('x-auth-token', authToken);

            expect(res.status).toBe(404);
        });

        it('should should return 404 if no genre with the given id exists', async () => {
            var id = mongoose.Types.ObjectId();
            const res = await request(server)
                .get('/api/genres/' + id)
                .set('x-auth-token', authToken);

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /', () => {
        const name = 'genre1';

        const createUserAuthToken = (isAdmin) => {
            const userInfo = {
                name: 'Sample Admin',
                email: 'sample@admin.com',
                password: '12345',
                isAdmin: isAdmin
            }

            return new User(userInfo).generateAuthToken();
        }

        it('should rename a genre if valid id is passed by an Admin', async () => {
            const name2 = 'genre2';
            let genre = new Genre({ name });
            genre = await genre.save();

            const authToken = createUserAuthToken(true);

            const res = await request(server)
                .put('/api/genres/' + genre._id)
                .set('x-auth-token', authToken)
                .send({ name: name2 });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', name2);
        });

        it('should return 404 is trying rename a genre with invalid genre id', async () => {
            const name2 = 'genre2';
            //let genre = new Genre({ name });
            //genre = await genre.save();

            // Create a random object ID that will not be in the database
            const id = mongoose.Types.ObjectId();

            const authToken = createUserAuthToken(true);

            const res = await request(server)
                .put('/api/genres/' + id)
                .set('x-auth-token', authToken)
                .send({ name: name2 });

            expect(res.status).toBe(404);
        });

        it('should return 400 if trying to rename rename a genre with invalid genre body', async () => {
            const name2 = 'genre2';
            let genre = new Genre({ name });
            genre = await genre.save();

            const authToken = createUserAuthToken(true);

            const res = await request(server)
                .put('/api/genres/' + genre._id)
                .set('x-auth-token', authToken)
                .send({ name2 });

            expect(res.status).toBe(400);
        });

        it('should return 400 if trying to rename a genre and new name is less than 5 characters', async () => {
            const name2 = 'a';
            let genre = new Genre({ name });
            genre = await genre.save();

            const authToken = createUserAuthToken(true);

            const res = await request(server)
                .put('/api/genres/' + genre._id)
                .set('x-auth-token', authToken)
                .send({ name: name2 });

            expect(res.status).toBe(400);
        });

        it('should return 400 if trying to rename a genre and new name is more than 50 characters', async () => {
            const name2 = new Array(52).join('a');
            let genre = new Genre({ name });
            genre = await genre.save();

            const authToken = createUserAuthToken(true);

            const res = await request(server)
                .put('/api/genres/' + genre._id)
                .set('x-auth-token', authToken)
                .send({ name: name2 });

            expect(res.status).toBe(400);
        });
    });

    describe('DELETE /', () => {
        const name = 'genre1';

        const createUserAuthToken = (isAdmin) => {
            const userInfo = {
                name: 'Sample Admin',
                email: 'sample@admin.com',
                password: '12345',
                isAdmin: isAdmin
            }

            return new User(userInfo).generateAuthToken();
        }

        it('should delete a genre if valid id is passed by an Admin', async () => {
            let genre = new Genre({ name });
            genre = await genre.save();

            const authToken = createUserAuthToken(true);

            const res = await request(server)
                .delete('/api/genres/' + genre._id)
                .set('x-auth-token', authToken);

            expect(res.status).toBe(200);
        });

        it('should return 403 if trying to delete a genre by non-Admin', async () => {
            let genre = new Genre({ name });
            genre = await genre.save();

            const authToken = createUserAuthToken(false);

            const res = await request(server)
                .delete('/api/genres/' + genre._id)
                .set('x-auth-token', authToken);

            expect(res.status).toBe(403);
        });

        it('should return 404 if trying to delete an invalid genre', async () => {
            const authToken = createUserAuthToken(true);
            const id = mongoose.Types.ObjectId();

            const res = await request(server)
                .delete('/api/genres/' + id)
                .set('x-auth-token', authToken);

            expect(res.status).toBe(404);
        });
    });

    describe('POST /', () => {
        // Define the happy path, and then in each test, we change
        // one parameter that clearly aligns with the name of the test

        let authToken;
        let name;

        const exec = async () => {
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', authToken)
                .send({ name });
        }

        beforeEach(() => {
            authToken = new User().generateAuthToken();
            name = 'genre1';
        });

        it('should return 401 if client is not logged in', async () => {
            authToken = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 400 if genre is less than 5 characters', async () => {
            name = 'abc';
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is more than 50 characters', async () => {
            name = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should save the genre if it is valid', async () => {
            const res = await exec();

            // Validate that the genre was saved in the database
            const genre = await Genre.find({ name: 'genre1' });

            expect(res.status).toBe(200);
            expect(genre).not.toBeNull();
        });

        it('should return the genre if it is valid', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', name);
        });
    });
});