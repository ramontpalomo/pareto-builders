import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { briefing } = await request.json()

    if (!briefing) {
      return NextResponse.json({ error: 'Briefing obrigatório' }, { status: 400 })
    }

    const prompt = `Você é um especialista em projetos de IA no Brasil. Analise este briefing de empresa e estruture os requisitos do projeto.

BRIEFING:
${briefing}

Responda APENAS com JSON válido:
{
  "titulo_projeto": "<título sugerido para o projeto>",
  "tipo_projeto": "<categorização: Automação RPA | Chatbot/Assistente | Análise de Dados | Computer Vision | LLM/Agente | Integração IA | Outro>",
  "complexidade": "<Simples|Médio|Alto|Estratégico>",
  "complexidade_justificativa": "<1 frase explicando a complexidade>",
  "prazo_estimado": "<estimativa realista de prazo>",
  "orcamento_indicativo": "<faixa de orçamento sugerida em R$>",
  "requisitos_tecnicos": ["<req1>", "<req2>", "<req3>"],
  "especialidades_necessarias": ["<esp1>", "<esp2>"],
  "perfil_ideal_builder": "<descrição do perfil ideal em 2 frases>",
  "perguntas_para_empresa": ["<pergunta1>", "<pergunta2>", "<pergunta3>"],
  "riscos": ["<risco1>", "<risco2>"],
  "proximos_passos": ["<passo1>", "<passo2>", "<passo3>"]
}`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro no briefing-analyzer:', error)
    return NextResponse.json({ error: 'Erro ao analisar briefing' }, { status: 500 })
  }
}
