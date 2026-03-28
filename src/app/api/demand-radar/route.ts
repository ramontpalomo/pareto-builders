import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function GET() {
  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Você é um analista de mercado especializado em IA no Brasil em 2026.

Gere dados do Radar de Demanda do marketplace Pareto Builders — quais especialidades de IA estão sendo mais buscadas por empresas brasileiras neste momento.

Retorne JSON com este formato exato:
{
  "habilidades": [
    {
      "nome": "LLM & Agentes",
      "demanda": 94,
      "tendencia": "alta",
      "variacao": "+23%",
      "descricao": "Agentes autônomos e LLMs para automação de processos complexos"
    }
  ],
  "insights": ["insight 1", "insight 2", "insight 3"],
  "setor_mais_ativo": "Varejo",
  "proximo_boom": "Computer Vision para inspeção industrial"
}

Inclua 8 habilidades. Tendência pode ser: "alta", "estavel", "queda". Variação deve ser percentual realista.
As habilidades são: LLM & Agentes, RAG & Search, Automação, Computer Vision, NLP, MLOps, Sales AI, FinTech AI, RPA, Data Science.
Retorne APENAS o JSON, sem markdown.`
      }]
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const data = JSON.parse(text)
    return NextResponse.json(data)
  } catch (e) {
    // Fallback com dados estáticos se a IA falhar
    return NextResponse.json({
      habilidades: [
        { nome: 'LLM & Agentes', demanda: 94, tendencia: 'alta', variacao: '+23%', descricao: 'Agentes autônomos para automação de processos complexos' },
        { nome: 'RAG & Search', demanda: 87, tendencia: 'alta', variacao: '+31%', descricao: 'Bases de conhecimento inteligentes com LLMs' },
        { nome: 'Automação', demanda: 82, tendencia: 'alta', variacao: '+18%', descricao: 'N8N, Make e automação de fluxos com IA' },
        { nome: 'Data Science', demanda: 76, tendencia: 'estavel', variacao: '+5%', descricao: 'Modelos preditivos e análise de dados' },
        { nome: 'NLP', demanda: 71, tendencia: 'alta', variacao: '+14%', descricao: 'Processamento de linguagem natural em português' },
        { nome: 'Computer Vision', demanda: 65, tendencia: 'alta', variacao: '+28%', descricao: 'Inspeção visual e reconhecimento de imagem' },
        { nome: 'MLOps', demanda: 58, tendencia: 'estavel', variacao: '+8%', descricao: 'Deploy e monitoramento de modelos em produção' },
        { nome: 'Sales AI', demanda: 52, tendencia: 'alta', variacao: '+19%', descricao: 'IA aplicada a vendas e CRM' },
      ],
      insights: [
        'Demanda por agentes IA cresceu 23% no último trimestre',
        'Empresas de varejo são as que mais buscam builders no momento',
        'RAG para bases de conhecimento internas é o projeto mais solicitado'
      ],
      setor_mais_ativo: 'Varejo & E-commerce',
      proximo_boom: 'Computer Vision para qualidade industrial'
    })
  }
}
