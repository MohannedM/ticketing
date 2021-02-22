import { NotFoundError } from '@microservices-tickets/common'
import express, { NextFunction, Request, Response } from 'express'
import { Ticket } from '../models/ticket'

const router = express.Router()

router.get('/api/tickets/:id', async (req: Request, res: Response, next: NextFunction) => {
    const ticket = await Ticket.findById(req.params.id)
    if(!ticket) {
        return next(new NotFoundError)
    }
    res.send(ticket)
})

export {router as showTicketRouter}