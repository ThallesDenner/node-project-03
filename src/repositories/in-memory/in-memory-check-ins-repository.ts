import { CheckInsRepository } from '@/repositories/check-ins-repository'
import { Prisma, CheckIn } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

export class InMemoryCheckInsRepository implements CheckInsRepository {
  public checkIns: CheckIn[] = []

  // Cria um check-in na memória
  async create(data: Prisma.CheckInUncheckedCreateInput) {
    const checkIn = {
      id: randomUUID(),
      createdAt: new Date(),
      validatedAt: data.validatedAt ? new Date(data.validatedAt) : null,
      userId: data.userId,
      gymId: data.gymId,
    }

    this.checkIns.push(checkIn)

    return checkIn
  }

  // Busca um check-in de um usuário numa determinada data
  async findByUserIdOnDate(userId: string, date: Date) {
    const startOfTheDay = dayjs(date).startOf('date') // Ex. 2024-01-10T00:00:00
    const endOfTheDay = dayjs(date).endOf('date') // Ex. 2024-01-10T23:59:59

    const checkInOnSameDate = this.checkIns.find((checkIn) => {
      const checkInDate = dayjs(checkIn.createdAt)
      const isOnSameDate =
        checkInDate.isSameOrAfter(startOfTheDay) &&
        checkInDate.isSameOrBefore(endOfTheDay)

      return checkIn.userId === userId && isOnSameDate
    })

    if (!checkInOnSameDate) {
      return null
    }

    return checkInOnSameDate
  }

  // Busca check-ins de um usuário (20 check-ins por página)
  async findManyByUserId(userId: string, page: number) {
    return this.checkIns
      .filter((checkIn) => checkIn.userId === userId)
      .slice((page - 1) * 20, page * 20)
  }

  // Retorna a quantidade de check-ins realizado pelo usuário
  async countByUserId(userId: string) {
    return this.checkIns.filter((checkIn) => checkIn.userId === userId).length
  }

  // Busca um check-in pelo id
  async findById(checkInId: string) {
    const checkIn = this.checkIns.find((checkin) => checkin.id === checkInId)

    if (!checkIn) {
      return null
    }

    return checkIn
  }

  // Salva o check-in atualizado na memória
  async update(data: CheckIn) {
    const checkInIndex = this.checkIns.findIndex(
      (checkin) => checkin.id === data.id,
    )

    if (checkInIndex >= 0) {
      this.checkIns[checkInIndex] = data
    }

    return data
  }
}

/*
Observações: 
- Quando os artefatos TypeScript são gerados pelo Prisma, além da geração da tipagem dos modelos prisma, também são geradas as tipagens de dados que devem ser 
fornecidos durante operações no banco de dados, por exemplo, o tipo CheckInUncheckedCreateInput especifica a tipagem dos dados para criação de check-ins no banco 
de dados.
- No caso dos métodos que retornam uma referência ao objeto, ao chamá-los em alguma parte da aplicação, se modificarmos qualquer uma das propriedades do objeto 
retornado, essa alteração será refletida no objeto salvo no banco de dados em memória. Podemos contornar isto usando structuredClone ou spread operator. Por 
exemplo: 

async findById(id: string) {
  const object = this.objects.find((object) => object.id === id)

  if (!object) {
    return null
  }

  return structuredClone(object) // ou return { ...object }
}
*/
