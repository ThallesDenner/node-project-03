import { UsersRepository } from '@/repositories/users-repository'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { User } from '@prisma/client'
import { compare } from 'bcryptjs'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

interface AuthenticateUseCaseResponse {
  user: User
}

export class AuthenticateUseCase {
  // Ao usar o modificador private no parâmetro do construtor, o TypeScript automaticamente cria a propriedade usersRepository na instância da classe, evitando a necessidade de declará-la explicitamente no corpo da classe.
  // eslint-disable-next-line no-useless-constructor
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    // Busca um usuário pelo email
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    // O método compare realiza os seguintes passos:
    // 1 - Extrai as informações incorporadas no hash armazenado.
    // 2 - Usa essas informações para aplicar na senha passada a mesma transformação que foi usada durante a geração do hash original.
    // 3 - Compara o resultado obtido com o hash armazenado.
    const doestPasswordMatches = await compare(password, user.passwordHash)

    if (!doestPasswordMatches) {
      throw new InvalidCredentialsError()
    }

    return {
      user,
    }
  }
}
