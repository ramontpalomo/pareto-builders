import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tccText, tccTitle } = body;

    if (!tccText) {
      return NextResponse.json({ error: "Texto do TCC obrigatório" }, { status: 400 });
    }

    const prompt = `Você é um especialista em avaliação de trabalhos acadêmicos de IA e tecnologia no Brasil. Analise o TCC de um aluno do MBA em IA da FMA (Faculdade Mar Atlântico) e extraia as competências demonstradas.

TÍTULO DO TCC: ${tccTitle || "Não informado"}

CONTEÚDO DO TCC (primeiros 3000 caracteres):
${tccText.slice(0, 3000)}

Analise e retorne APENAS JSON válido:
{
  "resumo_executivo": "<resumo do TCC em 3-4 frases>",
  "area_principal": "<área principal de especialização demonstrada>",
  "competencias_tecnicas": ["<competência1>", "<competência2>", "<competência3>", "<competência4>"],
  "tecnologias_identificadas": ["<tech1>", "<tech2>", "<tech3>"],
  "metodologias": ["<metodologia1>", "<metodologia2>"],
  "nivel_tecnico": "<Básico|Intermediário|Avançado|Especialista>",
  "especialidades_marketplace": ["<especialidade compatível com o marketplace1>", "<especialidade2>"],
  "pontos_destaque": ["<destaque acadêmico 1>", "<destaque acadêmico 2>"],
  "certificacao_gerada": {
    "nome": "TCC FMA — <área identificada>",
    "descricao": "<descrição profissional da certificação em 1 frase>",
    "tags": ["<tag1>", "<tag2>", "<tag3>"]
  }
}

Especialidades do marketplace: LLM & Agentes, RAG & Search, Automação, Computer Vision, NLP, MLOps, Fine-tuning, Dados & Analytics, Voz & Audio, IA para Negócios, Chatbots`;

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
    console.error("Erro no tcc-analyze:", error);
    return NextResponse.json({ error: "Erro ao analisar TCC" }, { status: 500 });
  }
}
