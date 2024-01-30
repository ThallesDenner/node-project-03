import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { FetchNearbyGymsUseCase } from './fetch-nearby-gyms'

let gymsRepository: InMemoryGymsRepository
let sut: FetchNearbyGymsUseCase

// A função describe é usada para agrupar testes em blocos lógicos chamados de "suites" (conjuntos) e "specs" (especificações).
describe('Fetch Nearby Gyms Use Case', () => {
  // beforeEach é uma função que é executada antes de cada teste
  beforeEach(async () => {
    // Como uma nova instância de InMemoryGymsRepository é criada antes de cada teste unitário, o banco de dados em memória estará vazio
    gymsRepository = new InMemoryGymsRepository()
    sut = new FetchNearbyGymsUseCase(gymsRepository)
  })

  // A função it faz a mesma coisa que a função test. Geralmente, usamos a função it para fornecer a descrição do teste seguindo o padrão "it should be able"
  it('should be able to fetch nearby gyms', async () => {
    // Como não desejamos testar o serviço de criação de academias, criamos as academias no banco de dados em memória usando gymsRepository em vez de usar CreateGymUseCase
    await gymsRepository.create({
      title: 'Near Gym',
      description: null,
      phone: null,
      latitude: -17.786223,
      longitude: -50.9646911,
    })

    await gymsRepository.create({
      title: 'Far Gym',
      description: null,
      phone: null,
      latitude: -17.8064154,
      longitude: -51.0936911,
    })

    const { gyms } = await sut.execute({
      userLatitude: -17.786223,
      userLongitude: -50.9646911,
    })

    // Verifica se o array gyms tem tamanho 1
    expect(gyms).toHaveLength(1)

    // Verifica se gyms é um array que possui um objeto contendo o campo title especificado
    expect(gyms).toEqual([expect.objectContaining({ title: 'Near Gym' })])
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
