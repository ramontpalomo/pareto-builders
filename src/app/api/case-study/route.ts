import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { description, builderName } = await request.json();

    if (!description) {
      return NextResponse.json({ error: "Descrição obrigatória" }, { status: 400 });
    }

    const prompt = `Você é um especialista em comunicação de tecnologia e IA. Com base na descrição informal de um projeto, crie um case study profissional para o portfólio de um AI Builder no Brasil.

Builder: ${builderName || "AI Builder"}

Descrição informal do projeto:
${description}

Crie um case study profissional e retorne APENAS JSON válido no formato:
{
  "title": "<título impactante e profissional do projeto>",
  "description": "<descrição executiva do projeto em 2-3 frases>",
  "contexto": "<contexto e desafio enfrentado pelo cliente>",
  "solucao": "<solução de IA implementada, com detalhes técnicos acessíveis>",
  "tecnologias": ["<tech1>", "<tech2>", "<tech3>"],
  "resultados": "<resultados mensuráveis e impacto gerado (use números quando possível)>",
  "licoes": "<principais aprendizados do projeto>",
  "tags": ["<tag1>", "<tag2>", "<tag3>", "<tag4>"]
}

Use linguagem profissional mas acessível. Destaque o valor de negócio gerado. Se a descrição não tiver números concretos, use estimativas razoáveis baseadas no contexto.`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro no case-study:", error);
    return NextResponse.json({ error: "Erro ao gerar case study" }, { status: 500 });
  }
}
