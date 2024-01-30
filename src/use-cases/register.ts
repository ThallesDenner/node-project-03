import { UsersRepository } from '@/repositories/users-repository'
import { hash } from 'bcryptjs'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import type { User } from '@prisma/client'

interface RegisterUseCaseRequest {
  name: string
  email: string
  password: string
}

interface RegisterUseCaseResponse {
  user: User
}

export class RegisterUseCase {
  // No TypeScript, quando declaramos uma propriedade dentro de uma classe sem o modificador static, essa propriedade é uma propriedade de instância.
  // private usersRepository: any

  // constructor(usersRepository: any) {
  //   this.usersRepository = usersRepository
  // }

  // A linha abaixo é equivalente ao código acima.
  // Ao usar o modificador private no parâmetro do construtor, o TypeScript automaticamente cria a propriedade usersRepository na instância da classe, evitando a necessidade de declará-la explicitamente no corpo da classe.
  // eslint-disable-next-line no-useless-constructor
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    name,
    email,
    password,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    // Criação do hash da senha
    // Quanto maior o fator de custo, mais lenta será a geração do hash e mais difícil será para um atacante realizar ataques de força bruta.
    // O valor 6 é um valor razoável para muitos casos de uso, mas pode ser ajustado conforme necessário.
    const passwordHash = await hash(password, 6)

    // Busca um usuário pelo email
    const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError()
    }

    // Cria um novo registro na tabela users
    const user = await this.usersRepository.create({
      name,
      email,
      passwordHash,
    })

    return {
      user,
    }
  }
}
