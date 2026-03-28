import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, builderName, personality, context, canPricing, history } =
      await request.json();

    if (!message) {
      return NextResponse.json({ error: "Mensagem obrigatória" }, { status: 400 });
    }

    const systemPrompt = `Você é o clone de IA de ${builderName || "um AI Builder"}, um implementador especializado em Inteligência Artificial.

Seu papel é representar ${builderName} de forma autêntica e profissional, respondendo em português brasileiro de maneira amigável e prestativa.

${personality ? `Personalidade e estilo de comunicação:\n${personality}\n` : ""}
${context ? `Contexto e informações importantes:\n${context}\n` : ""}

Diretrizes:
- Responda sempre em português brasileiro
- Seja profissional, prestativo e direto
- Fale na primeira pessoa como se fosse ${builderName}
- Compartilhe expertise em IA e implementações de forma clara
- Demonstre entusiasmo genuíno pelos projetos e desafios dos clientes
${canPricing ? "- Você pode discutir valores, investimentos e precificação de projetos" : "- Não discuta valores ou precificação — diga que prefere agendar uma conversa para falar sobre investimentos"}
- Se não souber algo específico, seja honesto e ofereça agendar uma conversa
- Mantenha respostas concisas mas completas
- NUNCA use markdown, asteriscos, hashtags ou formatação especial. Responda em texto simples e natural, como numa conversa real de WhatsApp`;

    const messages: Anthropic.MessageParam[] = [
      ...(history || []).map(
        (h: { role: "user" | "assistant"; content: string }) => ({
          role: h.role,
          content: h.content,
        })
      ),
      { role: "user", content: message },
    ];

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const reply =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Erro no clone chat:", error);
    return NextResponse.json(
      { error: "Erro ao processar mensagem" },
      { status: 500 }
    );
  }
}
