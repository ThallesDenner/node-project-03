import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import { usersRoutes } from './http/controllers/users/routes'
import { gymsRoutes } from './http/controllers/gyms/routes'
import { checkInsRoutes } from './http/controllers/check-ins/routes'
import { ZodError } from 'zod'
import { env } from './env'

export const app = fastify()

// A ordem de execução dos plugins é a mesma da que eles são registrados pelo Fastify, portanto, temos que cuidar com a ordem abaixo.

// fastifyJwt é um plugin para lidar com autenticação
// Isso irá decorar sua instância do fastify com os seguintes métodos: decode, sign e verify. Além disso, também irá registrar request.jwtVerify e response.jwtSign
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false, // o cookie refreshToken não será assinado, ou seja, ele não passará por um processo de hash e validação dentro do back-end
  },
  sign: {
    expiresIn: '10m', // o token de acesso tem uma duração de 10 minutos
  },
})

// fastifyCookie é um plugin que fornece uma interface fácil de usar para definir, recuperar e gerenciar cookies no contexto do Fastify
// O plugin adiciona o objeto cookies à solicitação (request) e resposta (response) do Fastify, permitindo a manipulação fácil de cookies
app.register(fastifyCookie)

// usersRoutes é um plugin que contém todas as rotas relacionadas ao recurso de usuários
app.register(usersRoutes)

// gymsRoutes é um plugin que contém todas as rotas relacionadas ao recurso de academias
app.register(gymsRoutes)

// checkInsRoutes é um plugin que contém todas as rotas relacionadas ao recurso de check-ins
app.register(checkInsRoutes)

// Manipulador de erros global
app.setErrorHandler((error, _, response) => {
  if (error instanceof ZodError) {
    return response
      .status(400) // o status HTTP 400 indica que o servidor não pode ou não irá processar a requisição devido a alguma coisa que foi entendida como um erro do cliente
      .send({ message: 'Validation error.', issues: error.format() })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO: Aqui devemos fazer login em uma ferramenta externa como DataDog, NewRelic, Sentry, etc.
  }

  return response.status(500).send({ message: 'Internal server error.' })
})
