import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { generateSlug } from '../utils/generate-slug'
import { prisma } from '../lib/prisma'
import { FastifyInstance } from 'fastify'

export async function getAttendeeBadget(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/attendees/:attendeeId/badge', {
      schema: {
        params: z.object({
          attendeeId: z.coerce.number()
        }),

        response: {
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
        throw new Error('attendee is not found')
      }


      return reply.status(200).send({ attendee })


    })
}