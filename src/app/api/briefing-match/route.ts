import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseServiceClient } from "@/lib/supabase-server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { briefing } = await request.json();

    if (!briefing) {
      return NextResponse.json({ error: "Briefing obrigatório" }, { status: 400 });
    }

    // Buscar todos os builders disponíveis
    const supabase = createSupabaseServiceClient();
    const { data: builders } = await supabase
      .from("builder_profiles")
      .select("*, profiles(full_name, email)")
      .eq("availability", "disponivel")
      .order("profile_score", { ascending: false })
      .limit(20);

    const buildersInfo = builders && builders.length > 0
      ? builders.map((b) => ({
          id: b.id,
          slug: b.slug,
          name: (b.profiles as { full_name: string } | null)?.full_name || "Builder",
          headline: b.headline,
          specialties: b.specialties || [],
          years_experience: b.years_experience,
          fma_verified: b.fma_verified,
          bio: b.bio?.slice(0, 200),
          profile_score: b.profile_score,
        }))
      : [
          { id: "mock1", slug: "lucas-mendonca", name: "Lucas Mendonça", headline: "Especialista em LLMs e RAG", specialties: ["LLM & Agentes", "RAG & Search"], years_experience: 5, fma_verified: true, bio: "Especialista em implementações de IA generativa", profile_score: 92 },
          { id: "mock2", slug: "ana-silva", name: "Ana Silva", headline: "AI Engineer", specialties: ["Automação", "NLP"], years_experience: 3, fma_verified: true, bio: "Focada em automação de processos com IA", profile_score: 88 },
          { id: "mock3", slug: "carlos-lima", name: "Carlos Lima", headline: "ML Engineer", specialties: ["Computer Vision", "MLOps"], years_experience: 4, fma_verified: false, bio: "Especialista em computer vision e deploy de modelos", profile_score: 79 },
        ];

    const prompt = `Você é um especialista em matchmaking de projetos de IA no Brasil. Analise o briefing de uma empresa e encontre os melhores AI Builders para o projeto.

BRIEFING DA EMPRESA:
${briefing}

BUILDERS DISPONÍVEIS:
${JSON.stringify(buildersInfo, null, 2)}

Analise cuidadosamente o briefing e retorne APENAS JSON válido:
{
  "requisitos": {
    "tipo_projeto": "<classificação do tipo de projeto>",
    "tecnologias_necessarias": ["<tech1>", "<tech2>"],
    "complexidade": "<Simples|Médio|Alto|Estratégico>",
    "prazo_estimado": "<estimativa de prazo>",
    "perfil_ideal": "<descrição do perfil ideal de builder>",
    "especialidades_necessarias": ["<esp1>", "<esp2>"]
  },
  "builders_rankeados": [
    {
      "id": "<builder_id>",
      "slug": "<builder_slug>",
      "name": "<nome>",
      "match_score": <número de 0 a 100>,
      "justificativa": "<por que este builder é adequado em 2 frases>",
      "pontos_fortes": ["<ponto1>", "<ponto2>"],
      "pontos_atencao": ["<atenção1>"]
    }
  ],
  "recomendacao_ia": "<recomendação geral da IA sobre como proceder com este projeto>"
}

Inclua apenas builders com match_score > 50. Ordene do maior para o menor score.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro no briefing-match:", error);
    return NextResponse.json({ error: "Erro ao processar briefing" }, { status: 500 });
  }
}
