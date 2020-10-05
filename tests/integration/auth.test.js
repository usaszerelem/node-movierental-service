
const { expectCt } = require('helmet');
const request = require('supertest');
const {Genre} = require('../../models/genres');
const {User} = require('../../models/users');
let server;

describe('authorization middleware', () =>{
    let authToken;

    beforeEach(() => {
        server = require('../../index');
        authToken = new User().generateAuthToken();
    });

    afterEach( async () => {
        // Removes all Genre documents
        await Genre.deleteMany({});
        await server.close();
    });

    const exec = () => {
        return request(server)
            .post('/api/genres')
            .set('x-auth-token', authToken)
            .send({ name: 'genre1'});
    }

    it('should return 401 if no token is provided', async () => {
        authToken = '';
        const res = await exec();
        expect(res.status).toBe(401);
    });

    it('should return 400 if invalid token is provided', async () => {
        authToken = 'a';
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('should return 200 if valid token is provided', async () => {
        const res = await exec();
        expect(res.status).toBe(200);
    });
});
