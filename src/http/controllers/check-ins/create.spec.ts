import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '@/app'
import request from 'supertest'
import { prisma } from '@/lib/prisma'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

// A função describe é usada para agrupar testes em blocos lógicos chamados de "suites" (conjuntos) e "specs" (especificações).
describe('Create Check-in (e2e)', () => {
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
  it('should be able to create a check-in', async () => {
    const { token } = await createAndAuthenticateUser(app)

    // Criação da academia (isto não é o ideal, pois estamos criando a academia sem passar pelas camadas de controle e serviço)
    const gym = await prisma.gym.create({
      data: {
        title: 'JavaScript Gym',
        latitude: -17.786223,
        longitude: -50.9646911,
      },
    })

    // Solicitação HTTP para a aplicação (criar check-in)
    const response = await request(app.server)
      .post(`/gyms/${gym.id}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        latitude: -17.786223,
        longitude: -50.9646911,
      })

    // Verifica se a resposta da API possui um código de status HTTP 201 (Created), indicando que o check-in foi criado com sucesso
    expect(response.statusCode).toEqual(201)
  })
})

/*
Observações:
- Por baixo dos panos de qualquer framework para Node (Fastify, Express, etc) existe um servidor Node; o que muda é a forma como esse servidor é acessado. No 
caso do Fastify, podemos acessar esse servidor da seguinte forma:
const app = fastify()
app.server
*/
