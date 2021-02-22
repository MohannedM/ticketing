import * as nats from 'node-nats-streaming'
import { TicketCreatedListener } from './events/ticket-created-listener'

const stan = nats.connect('ticketing', (Math.random() * 100).toString().replace('.', '-') + 'any', {
    url: 'http://localhost:4222'
})
// @ts-ignore
stan.on('connect', () => {
    console.log('Listener connected to NATS')

    // @ts-ignore
    stan.on('close', () => {
        console.log('NATS connection closed')
        // @ts-ignore
        process.exit()
    })

    new TicketCreatedListener(stan).listen()
})
// @ts-ignore
process.on('SIGINT', () => stan.close())
// @ts-ignore
process.on('SIGTERM', () => stan.close())

