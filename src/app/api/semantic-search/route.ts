import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query obrigatória" }, { status: 400 });
    }

    const SPECIALTIES = [
      "LLM & Agentes", "RAG & Search", "Automação", "Computer Vision",
      "NLP", "MLOps", "Fine-tuning", "Dados & Analytics", "Voz & Audio",
      "IA para Negócios", "Chatbots", "Visão Computacional"
    ];

    const prompt = `Você é um sistema de busca semântica para um marketplace de AI Builders brasileiro. Interprete a intenção de busca e extraia filtros relevantes.

QUERY DO USUÁRIO:
"${query}"

ESPECIALIDADES DISPONÍVEIS: ${SPECIALTIES.join(", ")}

Retorne APENAS JSON válido:
{
  "intencao": "<o que o usuário está buscando em 1 frase>",
  "especialidades": ["<especialidade1>", "<especialidade2>"],
  "palavras_chave": ["<keyword1>", "<keyword2>", "<keyword3>"],
  "nivel_experiencia": "<junior|pleno|senior|null>",
  "fma_preferido": <true|false|null>,
  "disponibilidade": "<disponivel|em_projeto|null>",
  "contexto": "<contexto adicional para filtrar resultados>"
}

Interprete linguagem natural como:
- "preciso de alguém com chatbot" → especialidades: ["Chatbots", "LLM & Agentes"]
- "implementar IA no meu RH" → especialidades: ["Automação", "NLP", "IA para Negócios"]
- "analisar imagens de produto" → especialidades: ["Computer Vision", "Visão Computacional"]
- "certificado FMA" → fma_preferido: true`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const filters = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return NextResponse.json(filters);
  } catch (error) {
    console.error("Erro no semantic-search:", error);
    return NextResponse.json({ error: "Erro na busca semântica" }, { status: 500 });
  }
}
