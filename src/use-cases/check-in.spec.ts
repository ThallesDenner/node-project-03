import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { CheckInUseCase } from '@/use-cases/check-in'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins-error'
import { MaxDistanceError } from './errors/max-distance-error'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

// A função describe é usada para agrupar testes em blocos lógicos chamados de "suites" (conjuntos) e "specs" (especificações).
describe('Check-in Use Case', () => {
  // beforeEach é uma função que é executada antes de cada teste
  beforeEach(async () => {
    // Como uma nova instância de InMemoryCheckInsRepository e InMemoryGymsRepository são criadas antes de cada teste unitário, o banco de dados em memória estará vazio
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)

    await gymsRepository.create({
      id: 'gym-01',
      title: 'JavaScript Gym',
      description: '',
      phone: '',
      latitude: -17.786223,
      longitude: -50.9646911,
    })

    // Substitui os temporizadores por implementações simuladas (útil para controlar o tempo durante os testes)
    vi.useFakeTimers()
  })

  // afterEach é uma função que é executada depois de cada teste
  afterEach(() => {
    // Restaura os temporizadores reais
    vi.useRealTimers()
  })

  // A função it faz a mesma coisa que a função test. Geralmente, usamos a função it para fornecer a descrição do teste seguindo o padrão "it should be able"
  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -17.786223,
      userLongitude: -50.9646911,
    })

    // Verifica se o id é uma string qualquer
    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be possible to check in twice on the same day', async () => {
    // Define a data e hora do sistema
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -17.786223,
      userLongitude: -50.9646911,
    })

    // Verifica se o erro que causou a rejeição da promisse retornada pelo método execute é uma instância de MaxNumberOfCheckInsError.
    // rejects é uma função associada ao objeto retornado por expect, que lida especificamente com promessas rejeitadas.
    // toBeInstanceOf(MaxNumberOfCheckInsError) é uma asserção que verifica se a rejeição é uma instância da classe MaxNumberOfCheckInsError.
    await expect(() =>
      sut.execute({
        gymId: 'gym-01',
        userId: 'user-01',
        userLatitude: -17.786223,
        userLongitude: -50.9646911,
      }),
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
  })

  it('should be possible to check in twice, but on different days', async () => {
    // Define a data e hora do sistema
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -17.786223,
      userLongitude: -50.9646911,
    })

    // Define a data e hora do sistema
    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0))

    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -17.786223,
      userLongitude: -50.9646911,
    })

    // Verifica se o id é uma string qualquer
    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be possible to check in to a distant gym', async () => {
    await gymsRepository.create({
      id: 'gym-02',
      title: 'JavaScript Gym',
      description: '',
      phone: '',
      latitude: -17.792655,
      longitude: -50.9508127,
    })

    // Verifica se o erro que causou a rejeição da promisse retornada pelo método execute é uma instância de MaxDistanceError.
    // rejects é uma função associada ao objeto retornado por expect, que lida especificamente com promessas rejeitadas.
    // toBeInstanceOf(MaxDistanceError) é uma asserção que verifica se a rejeição é uma instância da classe MaxDistanceError.
    await expect(() =>
      sut.execute({
        gymId: 'gym-02',
        userId: 'user-01',
        userLatitude: -17.786223,
        userLongitude: -50.9646911,
      }),
    ).rejects.toBeInstanceOf(MaxDistanceError)
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
- O método .toEqual é utilizado para comparar se o valor passado para a função expect é igual ao valor fornecido como argumento para .toEqual.
- vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0)) simula uma mudança no tempo do sistema para a data fornecida (2022-01-20T08:00:00). Portanto, dentro do escopo 
do método execute(), new Date() retornará a data simulada (2022-01-20T08:00:00) em vez da data real do sistema. Isto nos permite controlar o tempo para testar 
cenários específicos relacionados ao tempo sem depender do tempo real do sistema.
*/
