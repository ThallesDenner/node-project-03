import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSearchGymsUseCase } from '@/use-cases/factories/make-search-gyms-use-case'

export async function search(request: FastifyRequest, response: FastifyReply) {
  // Esquema Zod que define as regras para os parâmetros de consulta na requisição de pesquisa de academias
  const searchGymsQuerySchema = z.object({
    query: z.string(),
    page: z.coerce.number().min(1).default(1),
  })

  // A função parse realiza tanto a conversão quanto a validação dos dados de entrada (request.query) conforme o esquema definido (searchGymsQuerySchema)
  const { query, page } = searchGymsQuerySchema.parse(request.query)

  const searchGymsUseCase = makeSearchGymsUseCase()

  const { gyms } = await searchGymsUseCase.execute({
    query,
    page,
  })

  return response.status(200).send({
    gyms,
  }) // O status HTTP 200 indica que a requisição foi bem sucedida
}
