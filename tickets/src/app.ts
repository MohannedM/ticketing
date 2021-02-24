import express from 'express'
import cookieSession from 'cookie-session'
import { json } from 'body-parser'
import { errorHandler, NotFoundError, currentUser } from '@microservices-tickets/common'

import { createTicketRouter } from './routes/new'
import { showTicketRouter } from './routes/show'
import { indexTicketRouter } from './routes/index'
import { updateTicketRouter } from './routes/update'



const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(cookieSession({
  signed: false,
  secure: false,
}))

app.use(currentUser)

app.use(createTicketRouter)
app.use(showTicketRouter)
app.use(indexTicketRouter)
app.use(updateTicketRouter)

app.all('*', async (req, res, next) => {
   next(new NotFoundError())
})


app.use(errorHandler)

export { app }
