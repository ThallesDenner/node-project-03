import { CheckIn, Prisma } from '@prisma/client'

// Interface de contrato do repositório de check-ins
export interface CheckInsRepository {
  create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn>
  findByUserIdOnDate(userId: string, date: Date): Promise<CheckIn | null>
  findManyByUserId(userId: string, page: number): Promise<CheckIn[]>
  countByUserId(userId: string): Promise<number>
  findById(checkInId: string): Promise<CheckIn | null>
  update(data: CheckIn): Promise<CheckIn>
}

/*
Observações:
Os tipos CheckInCreateInput e CheckInUncheckedCreateInput gerados pelo Prisma estão relacionados à criação de registros para a entidade CheckIn em um banco de 
dados. Ambos os tipos incluem campos opcionais como id, createdAt e validatedAt. A distinção principal entre esses dois tipos reside na abordagem da criação de 
registros:

CheckInCreateInput:
- Este tipo é a versão "verificada" ou segura do ponto de vista de tipos. 
- Os campos user e gym são do tipo UserCreateNestedOneWithoutCheckInsInput e GymCreateNestedOneWithoutCheckInsInput, respectivamente, sugerindo que eles aceitam 
dados aninhados para criar registros de usuários e academias junto com o check-in.
- Esse tipo é mais expressivo e fortemente tipado, garantindo que você forneça dados consistentes ao criar um novo check-in.

CheckInUncheckedCreateInput:
- Este tipo é menos restrito e representa uma versão "não verificada" ou menos segura em termos de tipos.
- Utiliza diretamente os identificadores (userId e gymId) em vez de objetos aninhados.
- Pode ser usado quando você já tem os identificadores e não precisa da verificação de tipos mais rigorosa.

Em resumo, a principal diferença está na robustez e segurança de tipos:
- Use CheckInCreateInput quando você precisa de uma criação segura e expressiva, fornecendo dados aninhados para usuários e academias.
- Use CheckInUncheckedCreateInput quando você já tem os identificadores e está disposto a sacrificar a verificação de tipos mais rigorosa por simplicidade ou 
eficiência em casos específicos.
*/
