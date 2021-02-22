import request from 'supertest'
import { app } from '../../app'

it('returns 201 on successful signup', async () => {
    return request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'say123'
    })
    .expect(201)
})

it('returns 400 with an invalid email', async () => {
    return request(app)
    .post('/api/users/signup')
    .send({
        email: 'gibberish',
        password: 'say123'
    })
    .expect(400)
})

it('returns 400 with an invalid password', async () => {
    return request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: '1'
    })
    .expect(400)
})

it('returns 400 with missing email or password', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com'
    })
    .expect(400)

    return request(app)
    .post('/api/users/signup')
    .send({
        password: 'test12'
    })
    .expect(400)
})

it('disallows duplicate emails', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'say123'
    })
    .expect(201)

    return request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'say123'
    })
    .expect(400)
})

it('sets a cookie on successful signup', async () => {
    const response = await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'say123'
    })
    .expect(201)

    return expect(response.get('Set-Cookie')).toBeDefined()
})