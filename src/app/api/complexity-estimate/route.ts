import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json({ error: "Descrição obrigatória" }, { status: 400 });
    }

    const prompt = `Você é um especialista em projetos de IA e tecnologia no Brasil. Analise a descrição de um projeto e estime sua complexidade, prazo e orçamento.

DESCRIÇÃO DO PROJETO:
${description}

Retorne APENAS JSON válido no formato:
{
  "complexidade": "<Simples|Médio|Alto|Estratégico>",
  "complexidade_cor": "<green|yellow|orange|red>",
  "prazo_min": "<número>",
  "prazo_max": "<número>",
  "prazo_unidade": "<semanas|meses>",
  "orcamento_min": <número em reais sem formatação>,
  "orcamento_max": <número em reais sem formatação>,
  "perfil_builder": "<descrição do perfil ideal do builder>",
  "tecnologias_sugeridas": ["<tech1>", "<tech2>", "<tech3>"],
  "riscos": [
    {"risco": "<descrição do risco>", "mitigacao": "<como mitigar>"}
  ],
  "proximos_passos": ["<passo1>", "<passo2>", "<passo3>"],
  "resumo": "<análise executiva do projeto em 2-3 frases>"
}

Referências de complexidade e orçamento no mercado brasileiro de IA:
- Simples: automações básicas, chatbots simples → R$5k-20k, 2-6 semanas
- Médio: integrações com LLMs, RAG básico → R$20k-80k, 1-3 meses
- Alto: sistemas multi-agentes, fine-tuning → R$80k-300k, 3-6 meses
- Estratégico: plataformas de IA, transformação digital → R$300k+, 6+ meses`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro no complexity-estimate:", error);
    return NextResponse.json({ error: "Erro ao estimar complexidade" }, { status: 500 });
  }
}
