import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { ValidateCheckInUseCase } from './validate-check-in'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { CheckInAlreadyValidatedError } from './errors/check-in-already-validated-error'
import { LateCheckInValidationError } from './errors/late-check-in-validation-error'

let checkInsRepository: InMemoryCheckInsRepository
let sut: ValidateCheckInUseCase

// A função describe é usada para agrupar testes em blocos lógicos chamados de "suites" (conjuntos) e "specs" (especificações).
describe('Validate Check-in Use Case', () => {
  // beforeEach é uma função que é executada antes de cada teste
  beforeEach(async () => {
    // Como uma nova instância de InMemoryCheckInsRepository é criada antes de cada teste unitário, o banco de dados em memória estará vazio
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new ValidateCheckInUseCase(checkInsRepository)

    // Substitui os temporizadores por implementações simuladas (útil para controlar o tempo durante os testes)
    vi.useFakeTimers()
  })

  // afterEach é uma função que é executada depois de cada teste
  afterEach(() => {
    // Restaura os temporizadores reais
    vi.useRealTimers()
  })

  // A função it faz a mesma coisa que a função test. Geralmente, usamos a função it para fornecer a descrição do teste seguindo o padrão "it should be able"
  it('should be able to validate the check-in', async () => {
    // Como não desejamos testar o serviço de realização de check-ins aqui, criamos os check-ins no banco de dados em memória usando checkInsRepository em vez de usar CheckInUseCase
    const createdCheckIn = await checkInsRepository.create({
      gymId: 'gym-01',
      userId: 'user-01',
    })

    const { checkIn } = await sut.execute({
      checkInId: createdCheckIn.id,
    })

    // Verifica se validatedAt é uma data qualquer
    expect(checkIn.validatedAt).toEqual(expect.any(Date))

    // Verifica se validatedAt é uma data qualquer
    expect(checkInsRepository.checkIns[0].validatedAt).toEqual(expect.any(Date))
  })

  it('should not be able to validate an inexistent check-in', async () => {
    // Verifica se o erro que causou a rejeição da promisse retornada pelo método execute é uma instância de ResourceNotFoundError.
    // rejects é uma função associada ao objeto retornado por expect, que lida especificamente com promessas rejeitadas.
    // toBeInstanceOf(ResourceNotFoundError) é uma asserção que verifica se a rejeição é uma instância da classe ResourceNotFoundError.
    await expect(() =>
      sut.execute({
        checkInId: 'inexistent-check-in-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be possible to validate the same check-in more than once', async () => {
    // Como não desejamos testar o serviço de realização de check-ins aqui, criamos os check-ins no banco de dados em memória usando checkInsRepository em vez de usar CheckInUseCase
    const createdCheckIn = await checkInsRepository.create({
      gymId: 'gym-01',
      userId: 'user-01',
    })

    await sut.execute({
      checkInId: createdCheckIn.id,
    })

    // Verifica se o erro que causou a rejeição da promisse retornada pelo método execute é uma instância de CheckInAlreadyValidatedError.
    // rejects é uma função associada ao objeto retornado por expect, que lida especificamente com promessas rejeitadas.
    // toBeInstanceOf(CheckInAlreadyValidatedError) é uma asserção que verifica se a rejeição é uma instância da classe CheckInAlreadyValidatedError.
    await expect(() =>
      sut.execute({
        checkInId: createdCheckIn.id,
      }),
    ).rejects.toBeInstanceOf(CheckInAlreadyValidatedError)
  })

  it('should not be able to validate the check-in after 20 minutes of its creation', async () => {
    // Define a data e hora do sistema
    vi.setSystemTime(new Date(2023, 0, 1, 13, 40))

    const createdCheckIn = await checkInsRepository.create({
      gymId: 'gym-01',
      userId: 'user-01',
    })

    const twentyOneMinutesInMs = 1000 * 60 * 21

    // Avança o tempo simulado dos temporizadores em um determinado número de milissegundos
    vi.advanceTimersByTime(twentyOneMinutesInMs)

    // Verifica se o erro que causou a rejeição da promisse retornada pelo método execute é uma instância de LateCheckInValidationError.
    // rejects é uma função associada ao objeto retornado por expect, que lida especificamente com promessas rejeitadas.
    // toBeInstanceOf(LateCheckInValidationError) é uma asserção que verifica se a rejeição é uma instância da classe LateCheckInValidationError.
    await expect(() =>
      sut.execute({
        checkInId: createdCheckIn.id,
      }),
    ).rejects.toBeInstanceOf(LateCheckInValidationError)
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
