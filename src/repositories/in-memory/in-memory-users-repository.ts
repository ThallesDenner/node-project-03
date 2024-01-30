import { UsersRepository } from '@/repositories/users-repository'
import { User, Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'

export class InMemoryUsersRepository implements UsersRepository {
  public users: User[] = []

  // Salva um usuário na memória
  async create(data: Prisma.UserCreateInput) {
    const user = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role ?? 'MEMBER',
      createdAt: new Date(),
    }

    this.users.push(user)

    return user
  }

  // Busca um usuário pelo email
  async findByEmail(email: string) {
    const user = this.users.find((user) => user.email === email)

    if (!user) {
      return null
    }

    return user
  }

  // Busca um usuário pelo id
  async findById(id: string) {
    const user = this.users.find((user) => user.id === id)

    if (!user) {
      return null
    }

    return user
  }
}

/*
Observações
- Quando os artefatos TypeScript são gerados pelo Prisma, além da geração da tipagem dos modelos prisma, também são geradas as tipagens de dados que devem ser 
fornecidos durante operações no banco de dados, por exemplo, o tipo UserCreateInput especifica a tipagem dos dados para criação de usuários no banco de dados.
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
