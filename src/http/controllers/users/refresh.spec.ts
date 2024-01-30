import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import request from 'supertest'

// A função describe é usada para agrupar testes em blocos lógicos chamados de "suites" (conjuntos) e "specs" (especificações).
describe('Refresh Token (e2e)', () => {
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
  it('should be able to refresh a token', async () => {
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

    // Obtém os cookies que são enviados no cabeçalho 'Set-Cookie' da resposta HTTP da autenticação
    const cookies = authResponse.get('Set-Cookie')

    // Solicitação HTTP para a aplicação (criar um novo token de acesse e um novo token de atualização)
    const response = await request(app.server)
      .patch('/token/refresh')
      .set('Cookie', cookies)
      .send()

    // Verifica se a resposta da API possui um código de status HTTP 200 (Success), indicando que a requisição foi bem sucedida
    expect(response.status).toEqual(200)

    // Verifica se o corpo da resposta da API possui uma propriedade chamada token cujo valor é uma string qualquer
    expect(response.body).toEqual({
      token: expect.any(String),
    })

    // Verifica se o cookie enviado no cabeçalho 'Set-Cookie' da resposta da API contém uma string que inclui 'refreshToken='
    expect(response.get('Set-Cookie')).toEqual([
      expect.stringContaining('refreshToken='),
    ])
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
exemplo, para criar um novo par de tokens (de acesso e atualização) é necessário que o usuário esteja registrado e autenticado, então o código para simular o 
registro e autenticação de usuário deve estar dentro do teste de criação dos tokens de acesso e de atualização.
*/
