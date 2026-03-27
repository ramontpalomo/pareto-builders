import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { profile, projects, certifications } = await request.json();

    const prompt = `Você é um especialista em marketplaces de tecnologia e IA no Brasil. Analise o perfil de um AI Builder no marketplace Pareto Builders e dê um score de 0 a 100 com sugestões de melhoria.

PERFIL DO BUILDER:
- Nome: ${profile.full_name || "Não informado"}
- Headline: ${profile.headline || "Não informado"}
- Bio: ${profile.bio || "Não informada"}
- Especialidades: ${profile.specialties?.join(", ") || "Nenhuma"}
- Anos de experiência: ${profile.years_experience || 0}
- Disponibilidade: ${profile.availability || "Não informada"}
- LinkedIn: ${profile.linkedin_url ? "Informado" : "Não informado"}
- GitHub: ${profile.github_url ? "Informado" : "Não informado"}
- Website: ${profile.website_url ? "Informado" : "Não informado"}
- Foto: ${profile.avatar_url ? "Possui foto" : "Sem foto de perfil"}

PROJETOS (${projects?.length || 0} projetos):
${projects?.map((p: { title: string; description: string; results?: string; tags?: string[] }) => `- ${p.title}: ${p.description?.slice(0, 100)}... Resultados: ${p.results || "não informados"}`).join("\n") || "Nenhum projeto cadastrado"}

CERTIFICAÇÕES (${certifications?.length || 0}):
${certifications?.map((c: { name: string; issuer: string; fma_verified?: boolean }) => `- ${c.name} (${c.issuer})${c.fma_verified ? " [FMA]" : ""}`).join("\n") || "Nenhuma certificação"}

Responda APENAS com JSON válido no formato:
{
  "score": <número de 0 a 100>,
  "nivel": "<Iniciante|Em desenvolvimento|Bom|Ótimo|Excelente>",
  "resumo": "<frase de 1 linha sobre o estado geral do perfil>",
  "sugestoes": [
    {
      "prioridade": "<Alta|Media|Baixa>",
      "categoria": "<Identidade|Especialidades|Experiência|Projetos|Certificações|Redes Sociais>",
      "acao": "<ação específica a tomar>",
      "impacto": "<benefício esperado>"
    }
  ]
}

Seja específico e construtivo. Máximo 6 sugestões, priorizadas por impacto.`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 0, sugestoes: [] };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro no profile-score:", error);
    return NextResponse.json({ error: "Erro ao analisar perfil" }, { status: 500 });
  }
}
