import type { Insight, PetInsights } from '@/services/insightService';
import type { ActivityReport, ConsumptionReport, PetLatest } from '@/services/readingService';

/**
 * Monta a tela de Relatórios a partir dos dados do back-end
 * (atividade dos 7 dias, consumo dos potes e insights da IA).
 * Funções puras, sem rede.
 */

export type CardKind = 'activity' | 'feeding' | 'water';

export type ReportBar = { value: number; attention?: boolean };

export type ReportCard = {
  id: string;
  kind: CardKind;
  /** "ai" = veio do serviço de IA; "weekly" = calculado pelo app com as leituras da semana */
  source: 'ai' | 'weekly';
  title: string;
  description: string;
  attention: boolean;
  bars?: ReportBar[];
  footer: string;
  action?: 'activity' | 'food' | 'water';
};

export type PetReport = {
  /** null = ainda não há dados suficientes */
  score: number | null;
  summary: string;
  cards: ReportCard[];
};

const MIN_BAR = 6;
const ATTENTION_DROP_PCT = -25;
const LOW_BOWL_PERCENT = 25;
const MIN_DAYS_FOR_PATTERN = 3;

const WEEKDAY_NAMES = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

/** "no domingo", "na terça-feira" */
const onDay = (weekday: number) => `${weekday === 0 || weekday === 6 ? 'no' : 'na'} ${WEEKDAY_NAMES[weekday]}`;

const mean = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);

const stdDev = (values: number[]) => {
  const avg = mean(values);
  return Math.sqrt(mean(values.map((v) => (v - avg) ** 2)));
};

const toBars = (values: number[], hasData: boolean[], attentionBelow: number): ReportBar[] => {
  const max = Math.max(0, ...values);
  return values.map((v, i) => ({
    value: max > 0 ? Math.max(MIN_BAR, Math.round((v / max) * 100)) : MIN_BAR,
    attention: hasData[i] && v < attentionBelow,
  }));
};

/* ---------------- card de atividade ---------------- */

export function activityCard(name: string, week: ActivityReport | null | undefined): ReportCard | null {
  if (!week) return null;

  if (!week.hasDevice) {
    return {
      id: 'activity',
      kind: 'activity',
      source: 'weekly',
      title: 'Coleira não vinculada',
      description: `Vincule a coleira de ${name} para acompanhar a atividade da semana.`,
      attention: false,
      footer: 'Nenhuma leitura ainda',
    };
  }

  if (!week.hasData) {
    return {
      id: 'activity',
      kind: 'activity',
      source: 'weekly',
      title: 'Coletando dados de atividade',
      description: 'Assim que a coleira enviar leituras, a análise da semana aparece aqui.',
      attention: false,
      footer: 'Aguardando leituras',
    };
  }

  const pct = week.variationPct;
  const days = week.buckets.filter((b) => b.hasData);
  const avg = mean(days.map((b) => b.activeMinutes));
  const lowest = days.reduce((a, b) => (b.activeMinutes < a.activeMinutes ? b : a), days[0]);
  const highest = days.reduce((a, b) => (b.activeMinutes > a.activeMinutes ? b : a), days[0]);

  let title: string;
  let description: string;

  if (pct === null) {
    title = 'Atividade sem base de comparação ainda';
    description = `Precisamos de mais dias de leitura para comparar a atividade de ${name} com o habitual.`;
  } else if (pct <= ATTENTION_DROP_PCT) {
    title = `Atividade ${Math.abs(pct)}% menor que o habitual`;
    description = `${name} se movimentou menos que na semana anterior, principalmente ${onDay(lowest.weekday)}.`;
  } else if (pct >= -ATTENTION_DROP_PCT) {
    title = `Atividade ${pct}% maior que o habitual`;
    description = `Houve mais movimento que na semana anterior, com o pico ${onDay(highest.weekday)}.`;
  } else {
    title = 'Atividade dentro do habitual';
    description = `O nível de atividade de ${name} segue parecido com o da semana anterior.`;
  }

  return {
    id: 'activity',
    kind: 'activity',
    source: 'weekly',
    title,
    description,
    attention: pct !== null && pct <= ATTENTION_DROP_PCT,
    bars: toBars(
      week.buckets.map((b) => b.activeMinutes),
      week.buckets.map((b) => b.hasData),
      avg * 0.6,
    ),
    footer: 'Ver análise completa',
    action: 'activity',
  };
}

/* ---------------- cards de alimentação e água ---------------- */

export function consumptionCard(
  kind: 'food' | 'water',
  name: string,
  report: ConsumptionReport | null | undefined,
): ReportCard | null {
  if (!report || !report.hasDevice) return null;

  const isFood = kind === 'food';
  const cardKind: CardKind = isFood ? 'feeding' : 'water';
  const unit = isFood ? 'g' : 'ml';
  const subject = isFood ? 'alimentação' : 'consumo de água';
  const days = report.daily.filter((d) => d.hasData);

  if (days.length < MIN_DAYS_FOR_PATTERN) {
    return {
      id: kind,
      kind: cardKind,
      source: 'weekly',
      title: `Coletando dados de ${subject}`,
      description:
        days.length === 0
          ? `Assim que o pote enviar leituras, o padrão de ${subject} de ${name} aparece aqui.`
          : `Já temos ${days.length} dia(s) de registro. Com ${MIN_DAYS_FOR_PATTERN} ou mais, mostramos o padrão.`,
      attention: false,
      footer: 'Aguardando leituras',
    };
  }

  const values = days.map((d) => d.consumed);
  const avg = report.dailyAverage ?? Math.round(mean(values));
  const bars = toBars(
    report.daily.map((d) => d.consumed),
    report.daily.map((d) => d.hasData),
    mean(values) * 0.5,
  );

  if (mean(values) === 0) {
    return {
      id: kind,
      kind: cardKind,
      source: 'weekly',
      title: isFood ? 'Nenhum consumo de ração registrado' : 'Nenhum consumo de água registrado',
      description: `Não detectamos consumo no pote de ${isFood ? 'comida' : 'água'} de ${name} nos últimos dias.`,
      attention: true,
      footer: 'Ver consumo',
      action: kind,
    };
  }

  const variation = stdDev(values) / mean(values);
  const consistent = variation < 0.35;

  return {
    id: kind,
    kind: cardKind,
    source: 'weekly',
    title: consistent
      ? isFood ? 'Alimentação consistente' : 'Consumo de água consistente'
      : isFood ? 'Alimentação irregular' : 'Consumo de água irregular',
    description: consistent
      ? `Média de ${avg} ${unit} por dia, com pouca variação entre os dias da semana.`
      : `O consumo variou bastante entre os dias (média de ${avg} ${unit}/dia). Vale observar a rotina de ${name}.`,
    attention: !consistent,
    bars,
    footer: consistent ? 'Nenhuma ação necessária' : 'Ver consumo',
    action: consistent ? undefined : kind,
  };
}

/* ---------------- cards da IA ---------------- */

const AI_META: Record<string, { title: string; kind: CardKind }> = {
  behavior_anomaly: { title: 'Comportamento fora do padrão', kind: 'activity' },
  activity_vs_baseline: { title: 'Atividade diferente do habitual', kind: 'activity' },
  food_eaten_g_vs_baseline: { title: 'Consumo de ração diferente do habitual', kind: 'feeding' },
  water_drunk_ml_vs_baseline: { title: 'Consumo de água diferente do habitual', kind: 'water' },
  no_water: { title: 'Muito tempo sem beber água', kind: 'water' },
  food_forecast: { title: 'Previsão: ração acabando', kind: 'feeding' },
  water_forecast: { title: 'Previsão: água acabando', kind: 'water' },
  food_low: { title: 'Pote de comida baixo', kind: 'feeding' },
  water_low: { title: 'Pote de água baixo', kind: 'water' },
  water_empty: { title: 'Pote de água vazio', kind: 'water' },
  food_empty: { title: 'Pote de comida vazio', kind: 'feeding' },
};

const SEVERITY_ORDER: Record<string, number> = { critical: 0, warning: 1, info: 2 };
const MAX_AI_CARDS = 4;

const kindFromType = (type: string): CardKind =>
  type.includes('water') ? 'water' : type.includes('food') ? 'feeding' : 'activity';

export function aiCards(insights: PetInsights | null | undefined): ReportCard[] {
  const list: Insight[] = (insights?.insights ?? []).filter((i) => i.type !== 'all_good');

  return [...list]
    .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3))
    .slice(0, MAX_AI_CARDS)
    .map((insight, index) => {
      const meta = AI_META[insight.type];
      const kind = meta?.kind ?? kindFromType(insight.type);
      return {
        id: `ai-${insight.type}-${index}`,
        kind,
        source: 'ai' as const,
        title: meta?.title ?? 'Observação da IA',
        description: insight.message,
        attention: insight.severity !== 'info',
        footer: 'Gerado a partir das leituras recentes',
      };
    });
}

/* ---------------- nota de bem-estar ---------------- */

/**
 * Nota de 0 a 100 (heurística simples e transparente):
 * começa em 100 e perde pontos por alertas da IA, queda de atividade e potes quase vazios.
 */
export function computeScore(
  latest: PetLatest | null | undefined,
  week: ActivityReport | null | undefined,
  insights: PetInsights | null | undefined,
): number | null {
  const bowls = [latest?.foodBowl, latest?.waterBowl];
  const hasBowlData = bowls.some((b) => b && b.percent !== null);
  const hasData = !!week?.hasData || (insights?.insights.length ?? 0) > 0 || hasBowlData;
  if (!hasData) return null;

  let score = 100;

  for (const insight of insights?.insights ?? []) {
    if (insight.severity === 'critical') score -= 20;
    else if (insight.severity === 'warning') score -= 10;
  }

  const pct = week?.variationPct;
  if (pct !== null && pct !== undefined) {
    if (pct <= -50) score -= 20;
    else if (pct <= ATTENTION_DROP_PCT) score -= 10;
  }

  for (const bowl of bowls) {
    if (bowl && bowl.percent !== null && bowl.percent < LOW_BOWL_PERCENT) score -= 8;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function summaryText(score: number | null, attentionCount: number): string {
  if (score === null) return 'Coletando dados';
  if (attentionCount === 0 && score >= 85) return 'Tudo certo esta semana';
  if (score >= 75) return attentionCount === 1 ? 'Bom, com um ponto de atenção' : 'Bom, com pontos de atenção';
  if (score >= 50) return 'Merece atenção';
  return 'Precisa de atenção';
}

/* ---------------- relatório completo ---------------- */

export type ReportInput = {
  name: string;
  latest?: PetLatest | null;
  week?: ActivityReport | null;
  food?: ConsumptionReport | null;
  water?: ConsumptionReport | null;
  insights?: PetInsights | null;
};

export function buildPetReport({ name, latest, week, food, water, insights }: ReportInput): PetReport {
  const cards = [
    ...aiCards(insights),
    activityCard(name, week),
    consumptionCard('food', name, food),
    consumptionCard('water', name, water),
  ].filter((c): c is ReportCard => c !== null);

  // Pontos de atenção primeiro (a ordenação é estável: mantém a ordem dentro de cada grupo)
  cards.sort((a, b) => Number(b.attention) - Number(a.attention));

  const score = computeScore(latest, week, insights);
  const attentionCount = cards.filter((c) => c.attention).length;

  return { score, summary: summaryText(score, attentionCount), cards };
}