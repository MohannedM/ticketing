import { NotAuthorizedError, NotFoundError, OrderStatus } from '@microservices-tickets/common'
import express, { NextFunction, Request, Response } from 'express'
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher'
import { Order } from '../models/order'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.delete('/api/orders/:orderId', async (req: Request, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.orderId).populate('ticket')
    if(!order) {
        return next(new NotFoundError())
    }

    if(order.userId !== req.currentUser!.id){
        return next(new NotAuthorizedError())
    }
    order.status = OrderStatus.Cancelled
    await order.save()
    new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id,
        }
    })
    res.status(204).send(order)
})

export { router as deleteOrderRouter}