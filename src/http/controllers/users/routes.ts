import { FastifyInstance } from 'fastify'
import { register } from './register'
import { authenticate } from './authenticate'
import { profile } from './profile'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { refresh } from './refresh'

// Todo plugin do Fastify precisa ser uma função assíncrona, por isso usersRoutes é assíncrona
export async function usersRoutes(app: FastifyInstance) {
  // Rota para criação de usuários
  app.post('/users', register)

  // Rota para autenticação de usuários
  app.post('/sessions', authenticate)

  // Rota para criar um novo token de acesso e um novo token de atualização (está rota pode ser usada pelo fornt-end quando o token de acesso estiver expirado)
  app.patch('/token/refresh', refresh)

  // Rotas que exigem autenticação

  // Rota para obter o perfil do usuário
  // As funções de onRequest são executadas antes do controlador profile. Além disso, os objetos request e response são passados automaticamente para as funções
  app.get('/me', { onRequest: [verifyJwt] }, profile)
}

/*
Observações:
- Pense nas rotas da aplicação em termos de entidade. Por exemplo,
  Rota para criar usuários - POST: /users; 
  Rota para autenticar usuários - POST /sessions (isto é mais semântico do que /authenticate, pois authenticate é um verbo)
*/
