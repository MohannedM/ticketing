import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@microservices-tickets/common'
import express, { Request, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher '
import { Ticket } from '../models/ticket'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.put('/api/tickets/:id', requireAuth,[
    body('title').not().isEmpty().withMessage('Title must be provided'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
    const ticket = await Ticket.findById(req.params.id)
    if(!ticket) {
        return next(new NotFoundError())
    }

    if(ticket.orderId) {
        return next(new BadRequestError('Cannot edit a reserved ticket'))
    }

    if(ticket.userId !== req.currentUser!.id){
        return next(new NotAuthorizedError())
    }
    const {title, price} = req.body
    ticket.set({
        title,
        price
    })
    await ticket.save()
    await new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version,
    })
    res.status(201).send(ticket)
})

export { router as updateTicketRouter }