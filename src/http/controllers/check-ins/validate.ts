import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeValidateCheckInUseCase } from '@/use-cases/factories/make-validate-check-in-use-case'

export async function validate(
  request: FastifyRequest,
  response: FastifyReply,
) {
  // Esquema Zod que define as regras para os parâmetros de rota na requisição de validação do check-in
  const validateCheckInParamsSchema = z.object({
    checkInId: z.string().uuid(),
  })

  // A função parse realiza tanto a conversão quanto a validação dos dados de entrada (request.params) conforme o esquema definido (validateCheckInParamsSchema)
  const { checkInId } = validateCheckInParamsSchema.parse(request.params)

  const validateCheckInUseCase = makeValidateCheckInUseCase()

  await validateCheckInUseCase.execute({
    checkInId,
  })

  return response.status(204).send() // o status HTTP 204 indica que a solicitação foi bem sucedida e o cliente não precisa sair da página atual. Este status é comumente usado como resultado de uma solicitação PUT, atualizando um recurso, sem alterar o conteúdo atual da página.
}
