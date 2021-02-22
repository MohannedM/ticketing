import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose'

it('fetches an order for a particular user', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
      });
      await ticket.save();

  const userOne = global.signin()

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  const response = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', userOne)
    .expect(200);

});


it('returns an error if a user tries to fetch another user order', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
      });
      await ticket.save();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

    await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .expect(401);

});

