import { OrderStatus } from '@microservices-tickets/common'
import { Types } from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Order } from '../../models/order'
import { Payment } from '../../models/payment'
import { stripe } from '../../stripe'

it('returns a 404 when purchasing an order that does not exist', async () => {
    return request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: 'adsdsa',
        orderId: Types.ObjectId().toHexString()
    })
    .expect(404)
})
it('returns a 401 when trying to purchase an order that is not ours', async () => {
    const order = Order.build({
        id: Types.ObjectId().toHexString(),
        price: 66,
        status: OrderStatus.Created,
        userId: 'adsas',
        version: 0
    })
    await order.save()
    return request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: 'adsdsa',
        orderId: order.id
    })
    .expect(401)

})
it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = Types.ObjectId().toHexString()
    const order = Order.build({
        id: Types.ObjectId().toHexString(),
        price: 66,
        status: OrderStatus.Cancelled,
        userId,
        version: 0
    })
    await order.save()
    return request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        token: 'adsdsa',
        orderId: order.id
    })
    .expect(400)
})

it('returns 201 when sending the correct data', async () => {
    const userId = Types.ObjectId().toHexString()
    const price = Math.floor(Math.random() * 100000)
    const order = Order.build({
        id: Types.ObjectId().toHexString(),
        price,
        status: OrderStatus.Created,
        userId,
        version: 0
    })
    await order.save()
    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        token: 'tok_visa',
        orderId: order.id
    })
    .expect(201)

    const stripeCharges = stripe.charges.list({ limit: 50 })

    const stripeCharge = (await stripeCharges).data.find(charge => charge.amount === price * 100)

    expect(stripeCharge).toBeDefined()
    expect(stripeCharge!.currency).toEqual('usd')

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id,
    })

    expect(payment).not.toBeNull()
})