import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeFetchNearbyGymsUseCase } from '@/use-cases/factories/make-fetch-nearby-gyms-use-case'

export async function nearby(request: FastifyRequest, response: FastifyReply) {
  // Esquema Zod que define as regras para os parâmetros de consulta na requisição de academias próximas
  const nearbyGymsQuerySchema = z.object({
    latitude: z.coerce.number().refine((value) => {
      return Math.abs(value) <= 90
    }),
    longitude: z.coerce.number().refine((value) => {
      return Math.abs(value) <= 180
    }),
  })

  // A função parse realiza tanto a conversão quanto a validação dos dados de entrada (request.query) conforme o esquema definido (nearbyGymsQuerySchema)
  const { latitude, longitude } = nearbyGymsQuerySchema.parse(request.query)

  const fetchNearbyGymsUseCase = makeFetchNearbyGymsUseCase()

  const { gyms } = await fetchNearbyGymsUseCase.execute({
    userLatitude: latitude,
    userLongitude: longitude,
  })

  return response.status(200).send({
    gyms,
  }) // O status HTTP 200 indica que a requisição foi bem sucedida
}
