import fastify from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const app = fastify()
const prisma = new PrismaClient({
  log: ['query']
})

app.get('/', () => {
  return 'OK'
})

app.post('/events', async (request, reply) => {
  const createEventSchema = z.object({
    title: z.string().min(4),
    details: z.string().nullable(),
    maximumAttendees: z.number().int().positive().nullable()
  })

  const data = createEventSchema.parse(request.body)

  const event = await prisma.event.create({
    data: {
      ...data,
      slug: new Date().toISOString()
    }
  })

  return reply.status(201).send({ event })
})

app.listen({
  port: 3333
}).then(() => {
  console.log('Server Up in 3333')
}).finally(() => {
  console.log('ok')
})