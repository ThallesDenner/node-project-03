import { FastifyReply, FastifyRequest } from 'fastify'
import { Role } from '@prisma/client'

export function verifyUserRole(roleToVerify: Role) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { role } = request.user

    if (role !== roleToVerify) {
      return reply.status(401).send({ message: 'Unauthorized.' }) // o status HTTP 401 indica que a solicitação não foi aceita porque não possui credenciais de autenticação válidas para o recurso
    }
  }
}
