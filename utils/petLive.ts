import type { DashboardPet } from '@/data/dashboardPets';
import type { PetInsights } from '@/services/insightService';
import type {
    ActivityLevel,
    ActivityReport,
    BowlKind,
    BowlLatest,
    ConsumptionReport,
    Period,
    PetLatest,
} from '@/services/readingService';
import type { Ionicons } from '@expo/vector-icons';

/**
 * Transforma os números do back-end (leituras, relatórios, insights) nos textos e formatos
 * que as telas mostram. Funções puras, sem rede.
 */

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const two = (n: number) => String(n).padStart(2, '0');

/* ---------------- formatação ---------------- */

/** 154 -> "2h 34min", 45 -> "45min", 120 -> "2h". */
export function formatMinutes(total: number): string {
  const minutes = Math.round(total);
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

/** Hora local do aparelho (HH:MM). */
export function formatClock(iso: string): string {
  const d = new Date(iso);
  return `${two(d.getHours())}:${two(d.getMinutes())}`;
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "Hoje, 08:14", "Ontem, 19:32" ou "Seg, 12:08". */
export function formatDayTime(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, now)) return `Hoje, ${formatClock(iso)}`;
  if (sameDay(d, yesterday)) return `Ontem, ${formatClock(iso)}`;
  return `${WEEKDAYS[d.getDay()]}, ${formatClock(iso)}`;
}

/** "agora", "há 12 min", "há 3 h", "há 2 dias". */
export function formatAgo(iso: string, now: number = Date.now()): string {
  const minutes = Math.floor((now - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'há 1 dia' : `há ${days} dias`;
}

/* ---------------- estado do pet (Início) ---------------- */

const ACTIVITY_LABEL: Record<ActivityLevel, string> = {
  REPOUSO: 'Repouso',
  LEVE: 'Leve',
  MODERADA: 'Moderada',
  INTENSA: 'Intensa',
};

const ACTIVITY_PHRASE: Record<ActivityLevel, string> = {
  REPOUSO: 'descansando',
  LEVE: 'se movimentando',
  MODERADA: 'brincando',
  INTENSA: 'em plena atividade',
};

export const activityLabel = (level: ActivityLevel | null | undefined) => (level ? ACTIVITY_LABEL[level] : 'Sem dados');

export const bowlDescription = (bowl: BowlLatest | null | undefined): string => {
  if (!bowl) return 'Sem pote';
  if (bowl.percent === null) return 'Sem leituras';
  if (bowl.percent >= 60) return 'Nível confortável';
  if (bowl.percent >= 25) return 'Repor em breve';
  return 'Nível crítico';
};

export function petStatus(latest: PetLatest | null | undefined): string {
  const devices = latest ? [latest.collar, latest.foodBowl, latest.waterBowl].filter(Boolean) : [];
  if (devices.length === 0) return 'Sem dispositivos';
  if (devices.every((d) => !d!.online)) return 'Dispositivos offline';

  const lowBowl = [latest!.foodBowl, latest!.waterBowl].some((b) => b && b.percent !== null && b.percent < 25);
  return lowBowl ? 'Atenção' : 'Tudo tranquilo';
}

const SEVERITY_ORDER: Record<string, number> = { critical: 0, warning: 1, info: 2 };

/** Frase de insight mais importante: alertas antes de avisos, e "tudo certo" só se não houver outro. */
export function insightText(insights: PetInsights | null | undefined, name: string): string {
  const list = insights?.insights ?? [];
  if (list.length === 0) return `Ainda não há insights para ${name}.`;

  const meaningful = list.filter((i) => i.type !== 'all_good');
  const pool = meaningful.length ? meaningful : list;
  const top = [...pool].sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3))[0];
  return top.message;
}

/** Aplica os dados reais ao pet exibido na Home. */
export function applyLive(
  base: DashboardPet,
  latest: PetLatest | null | undefined,
  insights: PetInsights | null | undefined,
  now: number = Date.now(),
): DashboardPet {
  if (!latest) return base;

  const { collar, foodBowl, waterBowl } = latest;
  const level = collar?.activityLevel ?? null;

  return {
    ...base,
    online: [collar, foodBowl, waterBowl].some((d) => d?.online),
    status: petStatus(latest),
    message: level ? [`${base.name} está`, ACTIVITY_PHRASE[level]] : [base.name, 'ainda sem dados da coleira'],
    activity: activityLabel(level),
    activityTime: collar?.recordedAt ? formatAgo(collar.recordedAt, now) : '',
    food: foodBowl?.percent ?? 0,
    water: waterBowl?.percent ?? 0,
    foodDescription: bowlDescription(foodBowl),
    waterDescription: bowlDescription(waterBowl),
    insight: insightText(insights, base.name),
  };
}

/** 7 barras (px) do mini gráfico da Home a partir do relatório dos 7 dias. */
export function toMiniBars(week: ActivityReport | null | undefined): { bars: number[]; peakIndex: number } {
  const MIN = 8;
  const MAX = 48;
  const buckets = week?.buckets ?? [];
  const values = Array.from({ length: 7 }, (_, i) => buckets[i]?.activeMinutes ?? 0);
  const max = Math.max(0, ...values);
  if (max === 0) return { bars: values.map(() => MIN), peakIndex: -1 };

  return {
    bars: values.map((v) => Math.round(MIN + (v / max) * (MAX - MIN))),
    peakIndex: values.indexOf(max),
  };
}

/** Texto do selo do cartão de atividade, comparando hoje com o habitual. */
export function variationBadge(today: ActivityReport | null | undefined): string {
  const pct = today?.variationPct;
  if (pct === null || pct === undefined) return 'Coletando dados';
  if (pct > 25) return 'Acima do habitual';
  if (pct < -25) return 'Abaixo do habitual';
  return 'Normal hoje';
}

/* ---------------- tela de Atividade ---------------- */

type IconName = keyof typeof Ionicons.glyphMap;

export type Bar = { value: number; intense?: boolean };
export type Stat = { label: string; icon: IconName; value: string; hint: string };
export type PeriodData = {
  activeTime: string;
  /** null = ainda sem base de comparação */
  variation: string | null;
  bars: Bar[];
  axis: string[];
  summaryTitle: string;
  stats: Stat[];
};
export type ActivityEventView = { title: string; time: string; kind: 'intense' | 'rest'; duration: string };

const TODAY_AXIS = ['00h', '06h', '12h', '18h', '24h'];

const intensityText = (avg: number) => (avg < 0.1 ? 'Muito baixa' : avg < 0.35 ? 'Leve' : avg < 0.65 ? 'Moderada' : 'Alta');

export function toPeriodData(report: ActivityReport | null | undefined, period: Period): PeriodData {
  const has = !!report && report.hasData;
  const buckets = report?.buckets ?? [];
  const count = period === 'today' ? 12 : 7;

  // Hoje: intensidade média de cada bloco de 2 h. 7 dias: tempo ativo de cada dia.
  const values = Array.from({ length: count }, (_, i) =>
    period === 'today' ? (buckets[i]?.avgIntensity ?? 0) : (buckets[i]?.activeMinutes ?? 0),
  );
  const max = Math.max(0, ...values);
  const bars: Bar[] = values.map((v, i) => ({
    value: max > 0 ? Math.max(4, Math.round((v / max) * 100)) : 4,
    intense: buckets[i]?.intense ?? false,
  }));

  const axis =
    period === 'today'
      ? TODAY_AXIS
      : buckets.length === 7
        ? buckets.map((b) => WEEKDAYS[b.weekday])
        : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const peak = report?.peak;
  const peakHint = peak
    ? period === 'week'
      ? `${WEEKDAYS[new Date(peak.start).getDay()]} · ${formatMinutes(peak.minutes)}`
      : formatMinutes(peak.minutes)
    : 'Sem registro';

  const pct = report?.variationPct;

  return {
    activeTime: has ? formatMinutes(report!.activeMinutes) : '--',
    variation: pct === null || pct === undefined ? null : `${pct > 0 ? '+' : ''}${pct}%`,
    bars,
    axis,
    summaryTitle: period === 'today' ? 'Resumo de hoje' : 'Resumo dos 7 dias',
    stats: [
      {
        label: 'Tempo intenso',
        icon: 'flash-outline',
        value: has ? formatMinutes(report!.intenseMinutes) : '--',
        hint: 'Atividade intensa',
      },
      {
        label: 'Intensidade',
        icon: 'speedometer-outline',
        value: has && report!.avgIntensity !== null ? `${Math.round(report!.avgIntensity * 100)}%` : '--',
        hint: has && report!.avgIntensity !== null ? intensityText(report!.avgIntensity) : 'Sem registro',
      },
      {
        label: 'Repouso',
        icon: 'pulse-outline',
        value: has ? formatMinutes(report!.restMinutes) : '--',
        hint: 'Tempo de descanso',
      },
      {
        label: 'Pico ativo',
        icon: 'sparkles-outline',
        value: peak ? formatClock(peak.start) : '--',
        hint: peakHint,
      },
    ],
  };
}

export function toActivityEvents(report: ActivityReport | null | undefined, now: Date = new Date()): ActivityEventView[] {
  return (report?.events ?? []).map((e) => {
    const intense = e.kind === 'intense';
    const day = sameDay(new Date(e.start), now) ? '' : `${WEEKDAYS[new Date(e.start).getDay()]} `;
    return {
      title: intense ? 'Atividade intensa' : 'Período de descanso',
      time: `${day}${formatClock(e.start)} · ${intense ? 'atividade intensa' : 'repouso'}`,
      kind: e.kind,
      duration: formatMinutes(e.minutes),
    };
  });
}

/* ---------------- tela de Alimentação ---------------- */

export type HistoryItem = { title: string; time: string; amount: string };
export type FeedingView = { average: string; bars: number[]; axis: string[]; history: HistoryItem[] };

export function toFeedingView(
  report: ConsumptionReport | null | undefined,
  kind: BowlKind,
  now: Date = new Date(),
): FeedingView {
  const unit = kind === 'food' ? 'g' : 'ml';
  const daily = report?.daily ?? [];
  const max = Math.max(0, ...daily.map((d) => d.consumed));

  return {
    average: report?.dailyAverage != null ? `média ${report.dailyAverage} ${unit}` : 'sem média ainda',
    bars: Array.from({ length: 7 }, (_, i) => {
      const consumed = daily[i]?.consumed ?? 0;
      return max > 0 ? Math.max(3, Math.round((consumed / max) * 100)) : 3;
    }),
    axis: daily.length === 7 ? daily.map((d) => WEEKDAYS[d.weekday]) : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    history: (report?.events ?? []).map((e) => ({
      title: e.kind === 'refill' ? 'Pote reabastecido' : 'Consumo registrado',
      time: formatDayTime(e.at, now),
      amount: `${e.kind === 'refill' ? '+' : ''}${e.amount} ${unit}`,
    })),
  };
}