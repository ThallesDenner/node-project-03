import { expect, describe, it, beforeEach } from 'vitest'
import { hash } from 'bcryptjs'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { AuthenticateUseCase } from '@/use-cases/authenticate'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'

let usersRepository: InMemoryUsersRepository
let sut: AuthenticateUseCase

// A função describe é usada para agrupar testes em blocos lógicos chamados de "suites" (conjuntos) e "specs" (especificações).
describe('Authenticate Use Case', () => {
  // beforeEach é uma função que é executada antes de cada teste
  beforeEach(() => {
    // Como uma nova instância de InMemoryUsersRepository é criada antes de cada teste unitário, o banco de dados em memória estará vazio
    usersRepository = new InMemoryUsersRepository()
    sut = new AuthenticateUseCase(usersRepository)
  })

  // A função it faz a mesma coisa que a função test. Geralmente, usamos a função it para fornecer a descrição do teste seguindo o padrão "it should be able"
  it('should be able to authenticate', async () => {
    // Como não desejamos testar o serviço de criação de usuários aqui, criamos o usuário no banco de dados em memória usando usersRepository em vez de usar registerUseCase
    await usersRepository.create({
      name: 'Vanessa',
      email: 'vanessa@email.com',
      passwordHash: await hash('123456', 6),
    })

    const { user } = await sut.execute({
      email: 'vanessa@email.com',
      password: '123456',
    })

    // Verifica se o id é uma string qualquer
    expect(user.id).toEqual(expect.any(String))
  })

  it('should not be able to authenticate with wrong email', async () => {
    // Verifica se o erro que causou a rejeição da promisse retornada pelo método execute é uma instância de InvalidCredentialsError.
    // rejects é uma função associada ao objeto retornado por expect, que lida especificamente com promessas rejeitadas.
    // toBeInstanceOf(InvalidCredentialsError) é uma asserção que verifica se a rejeição é uma instância da classe InvalidCredentialsError.
    await expect(() =>
      sut.execute({
        email: 'vanessa@email.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to authenticate with wrong password', async () => {
    // Como não desejamos testar o serviço de criação de usuários aqui, criamos o usuário no banco de dados em memória usando usersRepository em vez de usar registerUseCase
    await usersRepository.create({
      name: 'Vanessa',
      email: 'vanessa@email.com',
      passwordHash: await hash('123456', 6),
    })

    // Verifica se o erro que causou a rejeição da promisse retornada pelo método execute é uma instância de InvalidCredentialsError.
    // rejects é uma função associada ao objeto retornado por expect, que lida especificamente com promessas rejeitadas.
    // toBeInstanceOf(InvalidCredentialsError) é uma asserção que verifica se a rejeição é uma instância da classe InvalidCredentialsError.
    await expect(() =>
      sut.execute({
        email: 'vanessa@email.com',
        password: '123123',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})

/*
Conceitos:
- Um teste não deve depender de outro, ou seja, cada teste deve ser escrito partindo do princípio que os outros testes não existem. Se ao escrever um teste, 
você precisar executar ações que são executadas em outro teste, o código deste outro teste deve estar dentro do teste que você está criando. Além disso, temos 
que garantir que cada teste unitário seja executado em um ambiente limpo, portanto, o banco de dados em memória deve estar zerado antes de cada teste.
- A expressão "System Under Test" se refere à parte específica do código que está sendo testada em um cenário de teste unitário. Então, em vez de nomearmos a 
funcionalidade que está sendo testada como authenticateUseCase, podemos nomear como sut.

Funções:
- A função expect é responsável por criar um objeto que representa uma expectativa de teste. Com esse objeto, você pode realizar várias asserções para verificar 
se o comportamento do código testado é o esperado.
- A função expect é chamada com um valor que você deseja avaliar (o resultado de uma operação, por exemplo). Essa chamada retorna um objeto que contém uma série 
de métodos, cada um representando uma asserção específica.
- No contexto de testes assíncronos, a função expect pode ser combinada com métodos específicos, como .resolves e .rejects, para lidar com promessas.
- O método .toEqual é utilizado para comparar se o valor passado para a função expect é igual ao valor fornecido como argumento para .toEqual.
*/
