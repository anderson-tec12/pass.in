import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { generateSlug } from '../utils/generate-slug'
import { prisma } from '../lib/prisma'
import { FastifyInstance } from 'fastify'
import { BadRequest } from './_errors/bad-request'

export async function getAttendeeBadget(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/attendees/:attendeeId/badge', {
      schema: {
        // summary: 'New event',
        tags: ['Attendees'],
        params: z.object({
          attendeeId: z.coerce.number()
        }),

        response: {
          200: z.object({
            badge: z.object({
              name: z.string(),
              email: z.string(),
              eventTitle: z.string(),
              checkInURL: z.string().url()
            })
          })
        }
      }
    }, async (request, reply) => {


      const { attendeeId } = request.params

      const attendee = await prisma.attendee.findUnique({
        where: {
          id: attendeeId
        },
        select: {
          name: true,
          email: true,
          event: {
            select: {
              title: true
            }
          }
        }
      })


      if (!attendee) {
        throw new BadRequest('attendee is not found')
      }

      const baseURL = `${request.protocol}://${request.hostname}`
      const checkInURL = new URL(`/attendees/${attendeeId}/check-in`, baseURL)


      return reply.status(200).send({
        badge: {
          name: attendee.name,
          email: attendee.email,
          eventTitle: attendee.event.title,
          checkInURL: checkInURL.toString()
        }
      })


    })
}