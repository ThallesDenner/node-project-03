import '@fastify/jwt'
import { Role } from '@prisma/client'

// Aqui, estamos dizendo ao TypeScript que vamos estender ou modificar as definições de tipos dentro do módulo '@fastify/jwt'.
// Portanto, essa é a definição de tipos que será puxada quando importarmos @fastify/jwt em algum arquivo
declare module '@fastify/jwt' {
  // Aqui, estamos estendendo a interface FastifyJWT adicionando novas propriedades. As propriedades existentes na interface original ainda permanecem.
  export interface FastifyJWT {
    // payload: { id: number } // o tipo de payload é usado para signing e verifying
    user: {
      sub: string
      role: Role
    } // o tipo de user é o tipo de retorno do objeto request.user
  }
}

/*
Observações:
- A importação da interface original é necessária para estender a tipagem fornecida pela biblioteca @fastify/jwt. Sem essa importação, o TypeScript entenderá que 
estamos criando um tipo do zero.
*/
