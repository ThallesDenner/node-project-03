import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeCreateGymUseCase } from '@/use-cases/factories/make-create-gym-use-case'

export async function create(request: FastifyRequest, response: FastifyReply) {
  // Esquema Zod que define as regras para o corpo da requisição de criação de academias
  const createGymBodySchema = z.object({
    title: z.string(),
    description: z.string().nullable(),
    phone: z.string().nullable(),
    latitude: z.number().refine((value) => {
      return Math.abs(value) <= 90
    }),
    longitude: z.number().refine((value) => {
      return Math.abs(value) <= 180
    }),
  })

  // A função parse realiza tanto a conversão quanto a validação dos dados de entrada (request.body) conforme o esquema definido (createGymBodySchema)
  const { title, description, phone, latitude, longitude } =
    createGymBodySchema.parse(request.body)

  const createGymUseCase = makeCreateGymUseCase()

  await createGymUseCase.execute({
    title,
    description,
    phone,
    latitude,
    longitude,
  })

  return response.status(201).send() // o status HTTP 201 é utilizado como resposta de sucesso, indica que a requisição foi bem sucedida e que um novo recurso foi criado
}

/*
Explicação da validação da latitude e longitude
- Na representação padrão do mapa mundi, a latitude é geralmente mapeada no eixo Y e a longitude no eixo X. Essa convenção é conhecida como sistema de 
coordenadas geográficas e segue a orientação comumente utilizada em cartografia.
- Latitude (Y): Refere-se à distância medida para o norte ou para o sul do equador. Os valores de latitude variam de -90° (sul) a +90° (norte), com 0° no equador.
- Longitude (X): Refere-se à distância medida para o leste ou para o oeste do meridiano de Greenwich. Os valores de longitude variam de -180° a +180°, com 0° no 
meridiano de Greenwich.
- Por exemplo, as coordenadas no Brasil são negativas, pois o país está a leste/sul no plano cartesiano. Por outro lado, as coordenadas nos Estados Unidos são 
negativas no eixo X e positivas no eixo Y, ou seja, a longitude é negativa e a latitudade é positiva.
*/
