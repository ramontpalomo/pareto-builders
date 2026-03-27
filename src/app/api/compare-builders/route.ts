import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseServiceClient } from "@/lib/supabase-server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { builderSlugs, briefing } = await request.json();

    if (!builderSlugs || builderSlugs.length < 2) {
      return NextResponse.json({ error: "Mínimo de 2 builders para comparar" }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data: builders } = await supabase
      .from("builder_profiles")
      .select("*, profiles(full_name), projects(*), certifications(*)")
      .in("slug", builderSlugs);

    const buildersData = builders && builders.length > 0 ? builders : builderSlugs.map((slug: string, i: number) => ({
      slug,
      profiles: { full_name: `Builder ${i + 1}` },
      headline: "AI Builder",
      specialties: ["LLM & Agentes"],
      years_experience: 3,
      fma_verified: i === 0,
      projects: [],
      certifications: [],
    }));

    const prompt = `Você é um consultor de projetos de IA. Compare ${buildersData.length} AI Builders e recomende o melhor para o projeto.

${briefing ? `PROJETO DA EMPRESA:\n${briefing}\n\n` : ""}

BUILDERS PARA COMPARAR:
${JSON.stringify(buildersData.map((b: {
  slug: string;
  profiles?: { full_name: string } | null;
  headline?: string;
  specialties?: string[];
  years_experience?: number;
  fma_verified?: boolean;
  bio?: string;
  projects?: { title: string; description?: string }[];
  certifications?: { name: string }[];
}) => ({
  slug: b.slug,
  nome: (b.profiles as { full_name: string } | null)?.full_name,
  headline: b.headline,
  especialidades: b.specialties,
  experiencia: b.years_experience,
  fma: b.fma_verified,
  bio: b.bio?.slice(0, 150),
  projetos: b.projects?.length || 0,
  certificacoes: b.certifications?.length || 0,
})), null, 2)}

Retorne APENAS JSON válido:
{
  "recomendado": "<slug do builder recomendado>",
  "justificativa_recomendacao": "<por que este é o melhor para o projeto em 3-4 frases>",
  "comparacao": [
    {
      "slug": "<slug>",
      "nome": "<nome>",
      "pontos_fortes": ["<ponto1>", "<ponto2>", "<ponto3>"],
      "pontos_fracos": ["<fraqueza1>"],
      "fit_projeto": <número 0-100>,
      "resumo": "<resumo em 1 frase>"
    }
  ],
  "criterios_comparados": ["Especialidades técnicas", "Experiência", "Certificação FMA", "Portfólio", "Fit com o projeto"]
}`;

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
    console.error("Erro no compare-builders:", error);
    return NextResponse.json({ error: "Erro ao comparar builders" }, { status: 500 });
  }
}
