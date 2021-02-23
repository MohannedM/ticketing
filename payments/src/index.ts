import mongoose from 'mongoose'
import { app } from './app'
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener'
import { OrderCreatedListener } from './events/listeners/order-created-listener'
import { natsWrapper } from './nats-wrapper'

const start = async () => {
  if(!process.env.JWT_KEY){
    throw new Error('JWT_KET must be defined')
  }
  if(!process.env.MONGO_URI){
    throw new Error('MONGO_URI must be defined')
  }
  if(!process.env.NATS_CLIENT_ID){
    throw new Error('NAT_CLIENT_ID must be defined')
  }
  if(!process.env.NATS_CLUSTER_ID){
    throw new Error('NATS_CLUSTER_ID must be defined')
  }
  if(!process.env.NATS_URL){
    throw new Error('NATS_URL must be defined')
  }

  try {
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID!, process.env.NATS_CLIENT_ID!, process.env.NATS_URL!)
      // @ts-ignore
      natsWrapper.client.on('close', () => {
          console.log('NATS connection closed')
          // @ts-ignore
          process.exit()
      })
    // @ts-ignore
    process.on('SIGINT', () => natsWrapper.client.close())
    // @ts-ignore
    process.on('SIGTERM', () => natsWrapper.client.close())

    new OrderCreatedListener(natsWrapper.client).listen()
    new OrderCancelledListener(natsWrapper.client).listen()

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    console.log('Connected to MongoDb')
  }catch (err) {
    console.error(err)
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000')
  })
}

start()

