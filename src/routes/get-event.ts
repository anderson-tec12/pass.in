import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { generateSlug } from '../utils/generate-slug'
import { prisma } from '../lib/prisma'
import { FastifyInstance } from 'fastify'

export async function getEvent(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/events/:eventId', {
      schema: {
        summary: 'Get event',
        tags: ['Events'],
        params: z.object({
          eventId: z.string().uuid()
        }),

        response: {
          // 201: z.object({
          //   eventId: z.string().uuid()
          // })
        }
      }
    }, async (request, reply) => {


      const { eventId } = request.params

      const event = await prisma.event.findUnique({
        where: {
          id: eventId
        },
        select: {
          id: true,
          details: true,
          title: true,
          slug: true,
          maximumAttendees: true,
          _count: {
            select: {
              attendees: true
            }
          }
        }
      })


      if (!event) {
        throw new Error('this event is not existies')
      }

      const eventResponse = { event, attendeesAmount: event._count.attendees }

      // delete eventResponse.event._count
      return reply.status(200).send(eventResponse)
    })
}