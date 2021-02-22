import request from 'supertest'
import { app } from '../../app'

it('returns 404 if the ticket was not found', async () => {
    const cookie = global.signin()

    return request(app)
    .get('/api/tickets/ndnnasndalsd')
    .set('Cookie', cookie)
    .send({})
    .expect(404)
})

it('returns the ticket if a correct id was provided', async () => {
    const title = 'New Ticket'
    const price = 40
    const cookie = global.signin()
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title,
        price,
    })
    .expect(201)

    const ticketResponse = await request(app)
     .get(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({})
    .expect(200)

    expect(ticketResponse.body.title).toEqual(title)
    expect(ticketResponse.body.price).toEqual(price)

})