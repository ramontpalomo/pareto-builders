import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseServiceClient } from "@/lib/supabase-server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    if (!query?.trim()) {
      return NextResponse.json({ error: "Query obrigatória" }, { status: 400 });
    }

    // 1. Buscar todos os builders ativos do Supabase
    const supabase = createSupabaseServiceClient();
    const { data: builders } = await supabase
      .from("builder_profiles")
      .select(
        "id, slug, full_name, headline, bio, specialties, years_experience, fma_verified, fma_grade, profile_score, availability, location, hourly_rate_min, hourly_rate_max, avatar_url"
      )
      .in("availability", ["available", "busy"])
      .order("profile_score", { ascending: false })
      .limit(30);

    if (!builders || builders.length === 0) {
      return NextResponse.json({ intencao: "Nenhum builder encontrado", builders: [] });
    }

    // 2. Preparar dados dos builders para o prompt
    const buildersJson = JSON.stringify(
      builders.map((b) => ({
        id: b.id,
        name: b.full_name,
        headline: b.headline,
        bio: (b.bio || "").slice(0, 400),
        specialties: b.specialties || [],
        years_experience: b.years_experience,
        fma_verified: b.fma_verified,
        fma_grade: b.fma_grade,
        availability: b.availability,
        location: b.location,
        rate:
          b.hourly_rate_min && b.hourly_rate_max
            ? `R$${b.hourly_rate_min}–${b.hourly_rate_max}/h`
            : null,
      })),
      null,
      2
    );

    // 3. Claude entende a query e ranqueia semanticamente os builders
    const prompt = `Você é um sistema de busca semântica para o marketplace Pareto Builders — plataforma brasileira de AI Builders certificados.

O usuário descreveu o que precisa em linguagem natural. Analise profundamente a intenção e ranqueie os builders mais adequados semanticamente (não apenas por palavras-chave).

NECESSIDADE DO USUÁRIO:
"${query}"

BUILDERS DISPONÍVEIS:
${buildersJson}

Analise cada builder considerando:
- Especialidades e como se encaixam com a necessidade
- Bio e headline para entender profundidade de experiência
- Semântica: "automatizar documentos fiscais" = Automação + OCR, "chatbot atendimento" = LLM & Agentes, etc.
- Disponibilidade: builders disponíveis têm prioridade
- Experiência adequada ao nível de complexidade implícito na necessidade

Retorne APENAS JSON válido:
{
  "intencao": "<resumo claro do que o usuário precisa — 1 frase em português>",
  "builders_rankeados": [
    {
      "id": "<builder_id exato>",
      "relevancia": <número inteiro 0-100>,
      "motivo": "<1 frase curta explicando por que este builder é adequado para ESTA necessidade específica>"
    }
  ]
}

Inclua apenas builders com relevância >= 35. Ordene do maior para o menor. Seja específico no motivo — cite especialidades concretas do builder.`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { intencao: query, builders_rankeados: [] };

    // 4. Merge scores da IA com os dados completos dos builders
    const builderMap = new Map(builders.map((b) => [b.id, b]));
    const ranked = (result.builders_rankeados || [])
      .filter(
        (r: { id: string; relevancia: number; motivo: string }) =>
          builderMap.has(r.id)
      )
      .map((r: { id: string; relevancia: number; motivo: string }) => ({
        ...builderMap.get(r.id),
        ai_relevancia: r.relevancia,
        ai_motivo: r.motivo,
      }));

    return NextResponse.json({
      intencao: result.intencao || query,
      builders: ranked,
    });
  } catch (error) {
    console.error("Erro semantic-search:", error);
    return NextResponse.json({ error: "Erro na busca semântica" }, { status: 500 });
  }
}
