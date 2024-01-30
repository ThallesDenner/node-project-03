import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { UsersRepository } from '../users-repository'

export class PrismaUsersRepository implements UsersRepository {
  // Cria um novo registro na tabela users
  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data,
    })

    return user
  }

  // Busca um usuário pelo email
  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    return user
  }

  // Busca um usuário pelo id
  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })

    return user
  }
}

/*
Observações
- Quando os artefatos TypeScript são gerados pelo Prisma, além da geração da tipagem dos modelos prisma, também são geradas as tipagens de dados que devem ser 
fornecidos durante operações no banco de dados, por exemplo, o tipo UserCreateInput especifica a tipagem dos dados para criação de usuários no banco de dados.
*/
