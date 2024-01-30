import { FastifyReply, FastifyRequest } from 'fastify'
import { makeGetUserProfileUseCase } from '@/use-cases/factories/make-get-user-profile-use.case'

export async function profile(request: FastifyRequest, response: FastifyReply) {
  const getUserProfile = makeGetUserProfileUseCase()

  const { user } = await getUserProfile.execute({
    userId: request.user.sub,
  })

  return response.status(200).send({
    user: {
      ...user,
      passwordHash: undefined,
    },
  }) // O status HTTP 200 indica que a requisição foi bem sucedida
}
