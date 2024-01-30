import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import request from 'supertest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

// A função describe é usada para agrupar testes em blocos lógicos chamados de "suites" (conjuntos) e "specs" (especificações).
describe('Search Gyms (e2e)', () => {
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
  it('should be able to search gyms by title', async () => {
    // Qualquer usuário autenticado pode pesquisar academias, porém como está sendo criado uma academia abaixo, o usuário precisa ter a função ADMIN
    const { token } = await createAndAuthenticateUser(app, true)

    // Solicitação HTTP para a aplicação (criar academia)
    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'JavaScript Gym',
        description: 'Some description.',
        phone: '64983560123',
        latitude: -17.786223,
        longitude: -50.9646911,
      })

    // Solicitação HTTP para a aplicação (criar academia)
    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'TypeScript Gym',
        description: 'Some description.',
        phone: '64986275147',
        latitude: -17.8064154,
        longitude: -51.0936911,
      })

    // Solicitação HTTP para a aplicação (pesquisar academias)
    const response = await request(app.server)
      .get('/gyms/search')
      .query({
        query: 'JavaScript',
      })
      .set('Authorization', `Bearer ${token}`)
      .send()

    // Verifica se a resposta da API possui um código de status HTTP 200 (Success), indicando que a requisição foi bem sucedida
    expect(response.statusCode).toEqual(200)

    // Verifica se o array gyms tem tamanho 1
    expect(response.body.gyms).toHaveLength(1)

    // Verifica se gyms é um array que possui um objeto contendo o campo title especificado
    expect(response.body.gyms).toEqual([
      expect.objectContaining({
        title: 'JavaScript Gym',
      }),
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
exemplo, para pesquisar academias é necessário que o usuário esteja registrado e autenticado. Ou seja, tanto o código para simular o registro de usuários como o 
código para simular o login de usuários devem estar dentro do teste de pesquisa de academias. No caso, o código referente a criação e autenticação de usuário 
está implementado na função createAndAuthenticateUser.
*/
