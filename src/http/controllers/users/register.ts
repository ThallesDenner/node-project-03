import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists-error'
import { makeRegisterUseCase } from '@/use-cases/factories/make-register-use-case'

export async function register(
  request: FastifyRequest,
  response: FastifyReply,
) {
  // Esquema Zod que define as regras para o corpo da requisição de criação de usuário
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
  })

  // A função parse realiza tanto a conversão quanto a validação dos dados de entrada (request.body) conforme o esquema definido (registerBodySchema)
  const { name, email, password } = registerBodySchema.parse(request.body)

  try {
    const registerUseCase = makeRegisterUseCase()

    await registerUseCase.execute({
      name,
      email,
      password,
    })
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return response.status(409).send({ message: error.message }) // o status HTTP 409 indica que a solicitação atual conflitou com um recurso que está no servidor
    }

    throw error
  }

  return response.status(201).send() // o status HTTP 201 é utilizado como resposta de sucesso, indica que a requisição foi bem sucedida e que um novo recurso foi criado
}
