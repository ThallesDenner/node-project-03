import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { GetUserMetricsUseCase } from './get-user-metrics'

let checkInsRepository: InMemoryCheckInsRepository
let sut: GetUserMetricsUseCase

// A função describe é usada para agrupar testes em blocos lógicos chamados de "suites" (conjuntos) e "specs" (especificações).
describe('Ger User Metrics Use Case', () => {
  // beforeEach é uma função que é executada antes de cada teste
  beforeEach(async () => {
    // Como uma nova instância de InMemoryCheckInsRepository é criada antes de cada teste unitário, o banco de dados em memória estará vazio
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new GetUserMetricsUseCase(checkInsRepository)
  })

  // A função it faz a mesma coisa que a função test. Geralmente, usamos a função it para fornecer a descrição do teste seguindo o padrão "it should be able"
  it('should be able to get check-ins count from metrics', async () => {
    // Como não desejamos testar o serviço de realização de check-ins aqui, criamos os check-ins no banco de dados em memória usando checkInsRepository em vez de usar CheckInUseCase
    await checkInsRepository.create({
      gymId: 'gym-01',
      userId: 'user-01',
    })

    await checkInsRepository.create({
      gymId: 'gym-02',
      userId: 'user-01',
    })

    const { checkInsCount } = await sut.execute({
      userId: 'user-01',
    })

    // Verifica se checkInsCount é estritamente igual a 2
    expect(checkInsCount).toBe(2)
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
*/
