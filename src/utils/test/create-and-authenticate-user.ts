import { FastifyInstance } from 'fastify'
import request from 'supertest'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function createAndAuthenticateUser(
  app: FastifyInstance,
  isAdmin = false,
) {
  // Registro do usuário (isto não é o ideal, pois estamos registrando o usuário sem passar pelas camadas de controle e serviço)
  await prisma.user.create({
    data: {
      name: 'Vanessa Silva',
      email: 'vanessa@email.com',
      passwordHash: await hash('123456', 6),
      role: isAdmin ? 'ADMIN' : 'MEMBER',
    },
  })

  // Solicitação HTTP para a aplicação (registrar usuário)
  await request(app.server).post('/users').send({
    name: 'Vanessa Silva',
    email: 'vanessa@email.com',
    password: '123456',
  })

  // Solicitação HTTP para a aplicação (realizar login)
  const authResponse = await request(app.server).post('/sessions').send({
    email: 'vanessa@email.com',
    password: '123456',
  })

  const { token } = authResponse.body

  return {
    token,
  }
}
