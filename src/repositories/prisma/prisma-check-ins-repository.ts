import { prisma } from '@/lib/prisma'
import { CheckInsRepository } from '@/repositories/check-ins-repository'
import { CheckIn, Prisma } from '@prisma/client'
// import dayjs from 'dayjs'

export class PrismaCheckInsRepository implements CheckInsRepository {
  // Cria um check-in no banco de dados
  async create(data: Prisma.CheckInUncheckedCreateInput) {
    const checkIn = await prisma.checkIn.create({
      data,
    })

    return checkIn
  }

  // Busca um check-in de um usuário numa determinada data
  async findByUserIdOnDate(userId: string, date: Date) {
    // const startOfTheDay = dayjs(date).startOf('date')
    // const endOfTheDay = dayjs(date).endOf('date')

    const checkIn = await prisma.checkIn.findFirst({
      where: {
        userId,
        // createdAt: {
        //   gte: startOfTheDay.toDate(),
        //   lte: endOfTheDay.toDate(),
        // },
        createdAt: {
          equals: new Date(
            date.getFullYear(),
            date.getMonth() - 1,
            date.getDay(),
          ),
        },
      },
    })

    return checkIn
  }

  // Busca check-ins de um usuário (20 check-ins por página)
  async findManyByUserId(userId: string, page: number) {
    const checkIns = await prisma.checkIn.findMany({
      where: {
        userId,
      },
      skip: (page - 1) * 20, // pula os x primeiros registros (semelhante ao OFFSET do MySQL)
      take: 20, // máximo de registros a serem retornados (semelhante ao LIMIT do MySQL)
    })

    return checkIns
  }

  // Retorna a quantidade de check-ins realizado pelo usuário
  async countByUserId(userId: string) {
    const count = await prisma.checkIn.count({
      where: {
        userId,
      },
    })

    return count
  }

  // Busca um check-in pelo id
  async findById(id: string) {
    const checkIn = await prisma.checkIn.findUnique({
      where: {
        id,
      },
    })

    return checkIn
  }

  // Salva o check-in atualizado no banco de dados
  async update(data: CheckIn) {
    const checkIn = await prisma.checkIn.update({
      where: {
        id: data.id,
      },
      data,
    })

    return checkIn
  }
}

/*
Observações
- Quando os artefatos TypeScript são gerados pelo Prisma, além da geração da tipagem dos modelos prisma, também são geradas as tipagens de dados que devem ser 
fornecidos durante operações no banco de dados, por exemplo, o tipo CheckInUncheckedCreateInput especifica a tipagem dos dados para criação de check-ins no banco 
de dados.
*/
