import { app } from "../../app"
import request from 'supertest'
import mongoose from 'mongoose'
import { Ticket } from "../../models/ticket"
import { Order, OrderStatus } from "../../models/order"
import { natsWrapper } from "../../nats-wrapper"

it('returns an error if the ticketId was not found', async () => {
    const ticketId = mongoose.Types.ObjectId()

    await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404)
})

it('returns an error if the ticket is reserved', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 10,
        title: 'test ticket'
    })
    await ticket.save()

    const order = Order.build({
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket,
        userId: 'dadsadasdas'
    })
    await order.save()

    await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(400)
})

it('reserves a ticket', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 10,
        title: 'test ticket'
    })
    await ticket.save()

    await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201)
})

it('emits an order created event', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 10,
        title: 'test ticket'
    })
    await ticket.save()

    await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})