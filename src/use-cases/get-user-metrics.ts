import { CheckInsRepository } from '@/repositories/check-ins-repository'

interface GetUserMetricsUseCaseRequest {
  userId: string
}

interface GetUserMetricsUseCaseResponse {
  checkInsCount: number
}

export class GetUserMetricsUseCase {
  // Ao usar o modificador private no parâmetro do construtor, o TypeScript automaticamente cria a propriedade checkInsRepository na instância da classe, evitando a necessidade de declará-la explicitamente no corpo da classe.
  // eslint-disable-next-line no-useless-constructor
  constructor(private checkInsRepository: CheckInsRepository) {}

  async execute({
    userId,
  }: GetUserMetricsUseCaseRequest): Promise<GetUserMetricsUseCaseResponse> {
    // Retorna a quantidade de check-ins realizado pelo usuário
    const checkInsCount = await this.checkInsRepository.countByUserId(userId)

    return {
      checkInsCount,
    }
  }
}
