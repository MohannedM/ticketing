import request from 'supertest'
import { app } from '../../app'

const createTicket = () => {
    const title = 'New Ticket'
    const price = 40
    const cookie = global.signin()
    return request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title,
        price,
    })
    .expect(201)
}

it('returns a list of tickets on the index route', async () => {
    await createTicket()
    await createTicket()
    await createTicket()

    const response = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200)

    expect(response.body.length).toEqual(3)
})