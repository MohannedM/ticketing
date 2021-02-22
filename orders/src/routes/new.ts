import express, { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@microservices-tickets/common'
import { body } from 'express-validator'
import { Ticket } from '../models/ticket'
import { Order } from '../models/order'
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const EXPIRATION_WINDOW_SECONDS = 15 * 60

const router = express.Router()

router.post(
    '/api/orders',
    requireAuth,
    [
        body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('TicketId must be provided')
    ],
    validateRequest,
 async (req: Request, res: Response, next: NextFunction) => {
     const { ticketId } = req.body
     const ticket = await Ticket.findById(ticketId)
     if(!ticket){
         return next(new NotFoundError())
     }

    const isReserved = await ticket.isReserved()
    if(isReserved) {
        return next(new BadRequestError('Ticket is already reserved'))
    }

    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    const order = Order.build({
        userId: req.currentUser!.id,
        expiresAt: expiration,
        status: OrderStatus.Created,
        ticket
    })
    await order.save()

    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        status: OrderStatus.Created,
        expiresAt: order.expiresAt.toISOString(),
        userId: order.userId,
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    })
    res.status(201).send(order)
})

export { router as newOrderRouter}