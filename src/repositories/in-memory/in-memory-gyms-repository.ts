import {
  FindManyNearbyParams,
  GymsRepository,
} from '@/repositories/gyms-repository'
import { getDistanceBetweenCoordinates } from '@/utils/get-distance-between-coordinates'
import { Gym, Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'

export class InMemoryGymsRepository implements GymsRepository {
  public gyms: Gym[] = []

  // Salva uma academia na memória
  async create(data: Prisma.GymCreateInput) {
    const gym = {
      id: data.id ?? randomUUID(),
      title: data.title,
      description: data.description ?? null,
      phone: data.phone ?? null,
      latitude: new Prisma.Decimal(data.latitude.toString()),
      longitude: new Prisma.Decimal(data.longitude.toString()),
      createdAt: new Date(),
    }

    this.gyms.push(gym)

    return gym
  }

  // Busca uma academia pelo id
  async findById(id: string) {
    const gym = this.gyms.find((gym) => gym.id === id)

    if (!gym) {
      return null
    }

    return gym
  }

  // Busca academias por meio de um termo de pesquisa (20 academias por página)
  async searchMany(query: string, page: number) {
    return this.gyms
      .filter((gym) => gym.title.includes(query))
      .slice((page - 1) * 20, page * 20)
  }

  // Busca academias próximas do usuário (até 10km)
  async findManyNearby(params: FindManyNearbyParams) {
    return this.gyms.filter((gym) => {
      const distance = getDistanceBetweenCoordinates(
        { latitude: params.latitude, longitude: params.longitude },
        {
          latitude: gym.latitude.toNumber(),
          longitude: gym.longitude.toNumber(),
        },
      )

      return distance < 10
    })
  }
}

/*
Observações
- Quando os artefatos TypeScript são gerados pelo Prisma, além da geração da tipagem dos modelos prisma, também são geradas as tipagens de dados que devem ser 
fornecidos durante operações no banco de dados, por exemplo, o tipo GymCreateInput especifica a tipagem dos dados para criação de academias no banco de dados.
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
