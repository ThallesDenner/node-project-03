import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { create } from './create'
import { validate } from './validate'
import { history } from './history'
import { metrics } from './metrics'
import { verifyUserRole } from '@/http/middlewares/verify-user-role'

// Todo plugin do Fastify precisa ser uma função assíncrona, por isso checkInsRoutes é assíncrona
export async function checkInsRoutes(app: FastifyInstance) {
  // O hook passado para o método addHook será executado assim que qualquer uma das rotas pertencentes ao contexto do plugin checkInsRoutes for acessada.
  // Portanto, todas as rotas neste arquivo só podem ser acessadas por usuários que estão autenticados.
  app.addHook('onRequest', verifyJwt)

  // Rota para criar check-ins
  app.post('/gyms/:gymId/check-ins', create)

  // Rota para obter o histórico de check-ins do usuário
  app.get('/check-ins/history', history)

  // Rota para obter metricas de check-ins realizados pelo usuário
  app.get('/check-ins/metrics', metrics)

  // Rotas que podem ser acessadas apenas por usuários com a função ADMIN

  // Rota para validade check-ins
  // As funções de onRequest são executadas antes do controlador validate. Além disso, os objetos request e response são passados automaticamente para as funções
  app.patch(
    '/check-ins/:checkInId/validate',
    { onRequest: [verifyUserRole('ADMIN')] },
    validate,
  )
}
