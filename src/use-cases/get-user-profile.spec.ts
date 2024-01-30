import { expect, describe, it, beforeEach } from 'vitest'
import { hash } from 'bcryptjs'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { GetUserProfileUseCase } from '@/use-cases/get-user-profile'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

let usersRepository: InMemoryUsersRepository
let sut: GetUserProfileUseCase

// A função describe é usada para agrupar testes em blocos lógicos chamados de "suites" (conjuntos) e "specs" (especificações).
describe('Get User Profile Use Case', () => {
  // beforeEach é uma função que é executada antes de cada teste
  beforeEach(() => {
    // Como uma nova instância de InMemoryUsersRepository é criada antes de cada teste unitário, o banco de dados em memória estará vazio
    usersRepository = new InMemoryUsersRepository()
    sut = new GetUserProfileUseCase(usersRepository)
  })

  // A função it faz a mesma coisa que a função test. Geralmente, usamos a função it para fornecer a descrição do teste seguindo o padrão "it should be able"
  it('should be able to get user profile', async () => {
    // Como não desejamos testar o serviço de criação de usuários aqui, criamos o usuário no banco de dados em memória usando usersRepository em vez de usar registerUseCase
    const createdUser = await usersRepository.create({
      name: 'Vanessa',
      email: 'vanessa@email.com',
      passwordHash: await hash('123456', 6),
    })

    const { user } = await sut.execute({
      userId: createdUser.id,
    })

    // Verifica se o nome do usuário é estritamente igual a Vanessa
    expect(user.name).toBe('Vanessa')
  })

  it('should not be able to get user profile with wrong id', async () => {
    // Verifica se o erro que causou a rejeição da promisse retornada pelo método execute é uma instância de ResourceNotFoundError.
    // rejects é uma função associada ao objeto retornado por expect, que lida especificamente com promessas rejeitadas.
    // toBeInstanceOf(ResourceNotFoundError) é uma asserção que verifica se a rejeição é uma instância da classe ResourceNotFoundError.
    await expect(() =>
      sut.execute({
        userId: 'non-existing-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})

/*
Conceitos:
- Um teste não deve depender de outro, ou seja, cada teste deve ser escrito partindo do princípio que os outros testes não existem. Se ao escrever um teste, 
você precisar executar ações que são executadas em outro teste, o código deste outro teste deve estar dentro do teste que você está criando. Além disso, temos 
que garantir que cada teste unitário seja executado em um ambiente limpo, portanto, o banco de dados em memória deve estar zerado antes de cada teste.
- A expressão "System Under Test" se refere à parte específica do código que está sendo testada em um cenário de teste unitário. Então, em vez de nomearmos a 
funcionalidade que está sendo testada como getUserProfileUseCase, podemos nomear como sut.

Funções:
- A função expect é responsável por criar um objeto que representa uma expectativa de teste. Com esse objeto, você pode realizar várias asserções para verificar 
se o comportamento do código testado é o esperado.
- A função expect é chamada com um valor que você deseja avaliar (o resultado de uma operação, por exemplo). Essa chamada retorna um objeto que contém uma série 
de métodos, cada um representando uma asserção específica.
- No contexto de testes assíncronos, a função expect pode ser combinada com métodos específicos, como .resolves e .rejects, para lidar com promessas.
*/
