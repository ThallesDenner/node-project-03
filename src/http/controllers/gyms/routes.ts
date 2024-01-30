import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { create } from './create'
import { search } from './search'
import { nearby } from './nearby'
import { verifyUserRole } from '@/http/middlewares/verify-user-role'

// Todo plugin do Fastify precisa ser uma função assíncrona, por isso gymsRoutes é assíncrona
export async function gymsRoutes(app: FastifyInstance) {
  // O hook passado para o método addHook será executado assim que qualquer uma das rotas pertencentes ao contexto do plugin gymsRoutes for acessada.
  // Portanto, todas as rotas neste arquivo só podem ser acessadas por usuários que estão autenticados.
  app.addHook('onRequest', verifyJwt)

  // Rota para pesquisar academias
  app.get('/gyms/search', search)

  // Rota para pesquisar academias próximas ao usuário
  app.get('/gyms/nearby', nearby)

  // Rotas que podem ser acessadas apenas por usuários com a função ADMIN

  // Rota para criação de academias
  // As funções de onRequest são executadas antes do controlador create. Além disso, os objetos request e response são passados automaticamente para as funções
  app.post('/gyms', { onRequest: [verifyUserRole('ADMIN')] }, create)
}
