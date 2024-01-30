import { expect, describe, it, beforeEach } from 'vitest'
import { compare } from 'bcryptjs'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { RegisterUseCase } from './register'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'

let usersRepository: InMemoryUsersRepository
let sut: RegisterUseCase

// A função describe é usada para agrupar testes em blocos lógicos chamados de "suites" (conjuntos) e "specs" (especificações).
describe('Register Use Case', () => {
  // beforeEach é uma função que é executada antes de cada teste
  beforeEach(() => {
    // Como uma nova instância de InMemoryUsersRepository é criada antes de cada teste unitário, o banco de dados em memória estará vazio
    usersRepository = new InMemoryUsersRepository()
    sut = new RegisterUseCase(usersRepository)
  })

  // A função it faz a mesma coisa que a função test. Geralmente, usamos a função it para fornecer a descrição do teste seguindo o padrão "it should be able"
  it('should be able to register', async () => {
    const { user } = await sut.execute({
      name: 'Vanessa',
      email: 'vanessa@email.com',
      password: '123456',
    })

    // Verifica se o id é uma string qualquer
    expect(user.id).toEqual(expect.any(String))
  })

  it("should be able to hash the user's password at registration time", async () => {
    const { user } = await sut.execute({
      name: 'Vanessa',
      email: 'vanessa@email.com',
      password: '123456',
    })

    // O método compare realiza os seguintes passos:
    // 1 - Extrai as informações incorporadas no hash armazenado.
    // 2 - Usa essas informações para aplicar na senha passada a mesma transformação que foi usada durante a geração do hash original.
    // 3 - Compara o resultado obtido com o hash armazenado.
    const isPasswordCorrectlyHashed = await compare('123456', user.passwordHash)

    // Verifica se isPasswordCorrectlyHashed é estritamente igual ao valor esperado (true)
    expect(isPasswordCorrectlyHashed).toBe(true)
  })

  it('should not be able to register with same email twice', async () => {
    const user = {
      name: 'Vanessa',
      email: 'vanessa@email.com',
      password: '123456',
    }

    await sut.execute(user)

    // Verifica se o erro que causou a rejeição da promisse retornada pelo método execute é uma instância de UserAlreadyExistsError.
    // rejects é uma função associada ao objeto retornado por expect, que lida especificamente com promessas rejeitadas.
    // toBeInstanceOf(UserAlreadyExistsError) é uma asserção que verifica se a rejeição é uma instância da classe UserAlreadyExistsError.
    await expect(() => sut.execute(user)).rejects.toBeInstanceOf(
      UserAlreadyExistsError,
    )
  })
})

/*
Conceitos:
- Um teste não deve depender de outro, ou seja, cada teste deve ser escrito partindo do princípio que os outros testes não existem. Se ao escrever um teste, 
você precisar executar ações que são executadas em outro teste, o código deste outro teste deve estar dentro do teste que você está criando. Além disso, temos 
que garantir que cada teste unitário seja executado em um ambiente limpo, portanto, o banco de dados em memória deve estar zerado antes de cada teste.
- A expressão "System Under Test" se refere à parte específica do código que está sendo testada em um cenário de teste unitário. Então, em vez de nomearmos a 
funcionalidade que está sendo testada como registerUseCase, podemos nomear como sut.

Funções:
- A função expect é responsável por criar um objeto que representa uma expectativa de teste. Com esse objeto, você pode realizar várias asserções para verificar 
se o comportamento do código testado é o esperado.
- A função expect é chamada com um valor que você deseja avaliar (o resultado de uma operação, por exemplo). Essa chamada retorna um objeto que contém uma série 
de métodos, cada um representando uma asserção específica.
- No contexto de testes assíncronos, a função expect pode ser combinada com métodos específicos, como .resolves e .rejects, para lidar com promessas.
- O método .toEqual é utilizado para comparar se o valor passado para a função expect é igual ao valor fornecido como argumento para .toEqual.
*/
