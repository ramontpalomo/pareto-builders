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

    // Buscar todos os builders do banco (disponíveis e ocupados para ter mais opções)
    const supabase = createSupabaseServiceClient();
    const { data: builders } = await supabase
      .from("builder_profiles")
      .select("id, slug, full_name, headline, specialties, years_experience, fma_verified, fma_grade, bio, profile_score, availability, location, hourly_rate_min, hourly_rate_max")
      .in("availability", ["available", "busy"])
      .order("profile_score", { ascending: false })
      .limit(20);

    const buildersInfo = builders && builders.length > 0
      ? builders.map((b) => ({
          id: b.id,
          slug: b.slug,
          name: b.full_name,
          headline: b.headline,
          specialties: b.specialties || [],
          years_experience: b.years_experience,
          fma_verified: b.fma_verified,
          fma_grade: b.fma_grade,
          bio: b.bio?.slice(0, 300),
          profile_score: b.profile_score,
          availability: b.availability,
          location: b.location,
          rate: b.hourly_rate_min && b.hourly_rate_max ? `R$${b.hourly_rate_min}-${b.hourly_rate_max}/hora` : null,
        }))
      : [
          { id: "mock1", slug: "lucas-mendonca", name: "Lucas Mendonça", headline: "Agentes de IA & Automação com LLMs", specialties: ["LLM & Agentes", "RAG & Search", "Automação"], years_experience: 5, fma_verified: true, fma_grade: "9.5", bio: "Especialista em agentes de IA com +30 projetos entregues.", profile_score: 95, availability: "available", location: "São Paulo, SP", rate: "R$350-600/hora" },
          { id: "mock2", slug: "marina-oliveira", name: "Marina Oliveira", headline: "Machine Learning & Data Science", specialties: ["Data Science", "MLOps", "NLP"], years_experience: 7, fma_verified: true, fma_grade: "9.8", bio: "Data Scientist com 7 anos em modelos preditivos e ML em produção.", profile_score: 98, availability: "available", location: "Rio de Janeiro, RJ", rate: "R$400-700/hora" },
          { id: "mock3", slug: "pedro-alves", name: "Pedro Alves", headline: "RAG & Busca Semântica", specialties: ["RAG & Search", "LLM & Agentes", "NLP"], years_experience: 6, fma_verified: true, fma_grade: "9.0", bio: "Arquiteto de sistemas RAG para grandes volumes de documentos.", profile_score: 90, availability: "available", location: "Brasília, DF", rate: "R$350-580/hora" },
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
