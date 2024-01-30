import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeCheckInUseCase } from '@/use-cases/factories/make-check-in-use-case'

export async function create(request: FastifyRequest, response: FastifyReply) {
  // Esquema Zod que define as regras para os parâmetros de rota na requisição de criação de check-in
  const createCheckInParamsSchema = z.object({
    gymId: z.string().uuid(),
  })

  // Esquema Zod que define as regras para o corpo da requisição de criação de check-in
  const createCheckInBodySchema = z.object({
    latitude: z.number().refine((value) => {
      return Math.abs(value) <= 90
    }),
    longitude: z.number().refine((value) => {
      return Math.abs(value) <= 180
    }),
  })

  // A função parse realiza tanto a conversão quanto a validação dos dados de entrada (request.params) conforme o esquema definido (createCheckInParamsSchema)
  const { gymId } = createCheckInParamsSchema.parse(request.params)

  // A função parse realiza tanto a conversão quanto a validação dos dados de entrada (request.body) conforme o esquema definido (createCheckInBodySchema)
  const { latitude, longitude } = createCheckInBodySchema.parse(request.body)

  const checkInUseCase = makeCheckInUseCase()

  await checkInUseCase.execute({
    gymId,
    userId: request.user.sub,
    userLatitude: latitude,
    userLongitude: longitude,
  })

  return response.status(201).send() // o status HTTP 201 é utilizado como resposta de sucesso, indica que a requisição foi bem sucedida e que um novo recurso foi criado
}
