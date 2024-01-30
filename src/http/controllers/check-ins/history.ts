import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeFetchUserCheckInsHistoryUseCase } from '@/use-cases/factories/make-fetch-user-check-ins-history-use-case'

export async function history(request: FastifyRequest, response: FastifyReply) {
  // Esquema Zod que define as regras para os parâmetros de consulta na requisição do histórico de check-ins
  const checkInHistoryQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
  })

  // A função parse realiza tanto a conversão quanto a validação dos dados de entrada (request.query) conforme o esquema definido (checkInHistoryQuerySchema)
  const { page } = checkInHistoryQuerySchema.parse(request.query)

  const fetchUserCheckInsHistoryUseCase = makeFetchUserCheckInsHistoryUseCase()

  const { checkIns } = await fetchUserCheckInsHistoryUseCase.execute({
    page,
    userId: request.user.sub,
  })

  return response.status(200).send({
    checkIns,
  }) // O status HTTP 200 indica que a requisição foi bem sucedida
}
