import { prisma } from '@/lib/prisma'
import { Gym, Prisma } from '@prisma/client'
import { FindManyNearbyParams, GymsRepository } from '../gyms-repository'

export class PrismaGymsRepository implements GymsRepository {
  // Cria um novo registro na tabela gyms
  async create(data: Prisma.GymCreateInput) {
    const gym = await prisma.gym.create({
      data,
    })

    return gym
  }

  // Busca uma academia pelo id
  async findById(id: string) {
    const gym = await prisma.gym.findUnique({
      where: {
        id,
      },
    })

    return gym
  }

  // Busca academias por meio de um termo de pesquisa (20 academias por página)
  async searchMany(query: string, page: number) {
    const gyms = await prisma.gym.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      take: 20,
      skip: (page - 1) * 20,
    })

    return gyms
  }

  // Busca academias próximas do usuário (até 10km)
  async findManyNearby({ latitude, longitude }: FindManyNearbyParams) {
    const gyms = await prisma.$queryRaw<Gym[]>`
      SELECT * FROM gyms
      WHERE ${latitude} = latitude AND ${longitude} = longitude 
      OR ( 6371 * acos( cos( radians(${latitude}) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(${longitude}) ) + sin( radians(${latitude}) ) * sin( radians( latitude ) ) ) ) <= 10
    `

    return gyms
  }
}

/*
Observações
- Quando os artefatos TypeScript são gerados pelo Prisma, além da geração da tipagem dos modelos prisma, também são geradas as tipagens de dados que devem ser 
fornecidos durante operações no banco de dados, por exemplo, o tipo GymCreateInput especifica a tipagem dos dados para criação de academias no banco de dados.
- A query SQL apresentada está realizando uma busca de todas as academias que estão a uma distância máxima de 10km da localização representada pela latitude e 
longitude informadas como parâmetros. A fórmula utilizada no WHERE é conhecida como Haversine Formula, e é utilizada para calcular a distância entre dois pontos 
em um globo. O resultado é multiplicado por 6371 para obter a distância em quilômetros.
- Usar a fórmula de Haversine diretamente no WHERE é mais performático do que buscar todas as academias e em seguida usar a função getDistanceBetweenCoordinates 
para obter as academias próximas ao usuário.
*/
