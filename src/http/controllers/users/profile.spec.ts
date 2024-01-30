import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import request from 'supertest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

// A função describe é usada para agrupar testes em blocos lógicos chamados de "suites" (conjuntos) e "specs" (especificações).
describe('Profile (e2e)', () => {
  // beforeAll é uma função que é executada uma vez antes de todos os testes deste conjunto.
  // A função passada para beforeAll garante que a aplicação esteja pronta para receber solicitações antes de iniciar os testes.
  beforeAll(async () => {
    await app.ready()
  })

  // afterAll é uma função que é executada uma vez após a conclusão de todos os testes deste conjunto.
  // A função passada para afterAll garante que a aplicação seja fechada para limpar qualquer estado ou recurso que possa ter sido criado durante os testes.
  afterAll(async () => {
    await app.close()
  })

  // A função it faz a mesma coisa que a função test. Geralmente, usamos a função it para fornecer a descrição do teste seguindo o padrão "it should be able"
  it('should be able to get user profile', async () => {
    const { token } = await createAndAuthenticateUser(app)

    // Solicitação HTTP para a aplicação (obter perfil do usuário)
    const profileResponse = await request(app.server)
      .get('/me')
      .set('Authorization', `Bearer ${token}`)
      .send()

    // Verifica se a resposta da API possui um código de status HTTP 200 (Success), indicando que a requisição foi bem sucedida
    expect(profileResponse.statusCode).toEqual(200)

    // Verifica se user é um objeto que contém o campo email especificado
    expect(profileResponse.body.user).toEqual(
      expect.objectContaining({
        email: 'vanessa@email.com',
      }),
    )
  })
})

/*
Observações:
- Por baixo dos panos de qualquer framework para Node (Fastify, Express, etc) existe um servidor Node; o que muda é a forma como esse servidor é acessado. No 
caso do Fastify, podemos acessar esse servidor da seguinte forma:
const app = fastify()
app.server

- Um teste não deve depender de outro, ou seja, cada teste deve ser escrito partindo do princípio que os outros testes não existem. Se ao escrever um teste, 
você percebe que precisa executar ações que são executadas em outro teste, o código deste outro teste deve estar dentro do teste que você está criando. Por 
exemplo, para obter o perfil de um usuário é necessário realizar login antes, no entanto, para isto é necessário registrar o usuário antes. Ou seja, tanto o 
código para simular o registro de usuários como o código para simular o login de usuários devem estar dentro do teste de obtenção do perfil de usuários. No caso, 
o código referente a criação e autenticação de usuário está implementado na função createAndAuthenticateUser.
*/
