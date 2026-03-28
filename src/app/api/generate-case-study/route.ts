import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { builderName, projectTitle, client: clientName, challenge, solution, technologies, results, duration } = await request.json()

    const prompt = `Você é um especialista em comunicação de marketing para o mercado de tecnologia e IA no Brasil.
Transforme as informações brutas de um projeto em um case study profissional e persuasivo para o portfólio de um AI Builder.

INFORMAÇÕES DO PROJETO:
- Builder: ${builderName}
- Título do projeto: ${projectTitle}
- Cliente: ${clientName || 'Empresa confidencial'}
- Desafio: ${challenge}
- Solução implementada: ${solution}
- Tecnologias utilizadas: ${technologies || 'IA, Machine Learning'}
- Resultados obtidos: ${results}
- Duração: ${duration || 'Não informado'}

Crie um case study profissional em português. Responda APENAS com JSON:
{
  "titulo": "<título impactante para o case>",
  "resumo_executivo": "<2-3 frases que resumem o impacto do projeto>",
  "contexto": "<parágrafo sobre o contexto e desafio do cliente>",
  "solucao": "<parágrafo detalhando a solução de IA implementada>",
  "tecnologias": ["<tech1>", "<tech2>"],
  "resultados": [
    { "metrica": "<nome da métrica>", "valor": "<resultado>", "descricao": "<contexto>" }
  ],
  "depoimento_sugerido": "<depoimento fictício sugerido para o cliente validar>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"]
}`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro no generate-case-study:', error)
    return NextResponse.json({ error: 'Erro ao gerar case study' }, { status: 500 })
  }
}
