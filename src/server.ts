import fastify from 'fastify'
import { z } from 'zod'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'

import { generateSlug } from './utils/generate-slug'
import { createEvent } from './routes/create-events'
import { prisma } from './lib/prisma'
import { registerForEvent } from './routes/register-for-event'
import { getEvent } from './routes/get-event'
import { getAttendeeBadget } from './routes/get-attendee-badge'

const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)



app.get('/', () => {
  return 'OK'
})

app
  .post('/eventsOld', async (request, reply) => {
    const createEventSchema = z.object({
      title: z.string().min(4),
      details: z.string().nullable(),
      maximumAttendees: z.number().int().positive().nullable()
    })

    const { details, maximumAttendees, title } = createEventSchema.parse(request.body)
    const slug = generateSlug(title)

    const eventWithSameSlug = await prisma.event.findUnique({
      where: {
        slug
      }
    })


    if (eventWithSameSlug) {
      throw new Error('another event with same title already exists')
    }


    const event = await prisma.event.create({
      data: {
        title,
        details,
        maximumAttendees,
        slug
      }
    })

    return reply.status(201).send({ event })
  })

app.register(createEvent)
app.register(getEvent)
app.register(registerForEvent)
app.register(getAttendeeBadget)

app.listen({
  port: 3333
}).then(() => {
  console.log('Server Up in 3333')
}).finally(() => {
  console.log('ok')
})