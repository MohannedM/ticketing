import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { natsWrapper } from '../../nats-wrapper'
import { Ticket } from '../../models/ticket'

it('returns 404 if the id provided was not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    return request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
        title: 'any',
        price: 20
    })
    .expect(404)
})

it('returns 401 if the user was not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    return request(app)
    .put(`/api/tickets/${id}`)
    .send({})
    .expect(401)
})

it('returns 401 if the user did not own the ticket', async () => {
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
        title: 'any',
        price: 20
    })
    .expect(201)

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
        title: 'any update',
        price: 21
    })
    .expect(401)
})

it('returns 400 if invalid title or price was provided', async () => {
    const cookie = global.signin()
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: 'any',
        price: 20
    })
    .expect(201)

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: '',
        price: 21
    })
    .expect(400)

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'any update',
        price: -10
    })
    .expect(400)
})

it('returns 201 and update the ticket if the ticket was updated successfully', async () => {
    const cookie = global.signin()
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: 'any',
        price: 20
    })
    .expect(201)

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'any title updated',
        price: 21
    })
    .expect(201)

    const ticketResponse =  await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200)

    expect(ticketResponse.body.title).toEqual('any title updated')
    expect(ticketResponse.body.price).toEqual(21)
})

it('publishes an event after updating a ticket', async () => {
    const cookie = global.signin()
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: 'any',
        price: 20
    })
    .expect(201)

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'any title updated',
        price: 21
    })
    .expect(201)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('rejects update if ticket is reserved', async () => {
    const cookie = global.signin()
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: 'any',
        price: 20
    })
    .expect(201)
    const ticket = await Ticket.findById(response.body.id)
    ticket.set({ orderId: mongoose.Types.ObjectId().toHexString()})
    await ticket.save()
    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'any title updated',
        price: 21
    })
    .expect(400)
})