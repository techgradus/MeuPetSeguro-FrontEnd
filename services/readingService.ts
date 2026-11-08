import { api } from '@/services/api';

/**
 * Leituras dos sensores.
 * O back-end devolve números e datas; os textos da tela são montados em utils/petLive.ts.
 */
export type ActivityLevel = 'REPOUSO' | 'LEVE' | 'MODERADA' | 'INTENSA';
export type Period = 'today' | 'week';
export type BowlKind = 'food' | 'water';

type DeviceState = { online: boolean; batteryLevel: number | null; lastSyncAt: string | null };

export type CollarLatest = DeviceState & {
  activityLevel: ActivityLevel | null;
  intensity: number | null;
  recordedAt: string | null;
};

export type BowlLatest = DeviceState & {
  weightGrams: number | null;
  percent: number | null;
  recordedAt: string | null;
};

/** Estado "agora" do pet: null em cada item = o pet não tem esse dispositivo. */
export type PetLatest = {
  petId: string;
  collar: CollarLatest | null;
  foodBowl: BowlLatest | null;
  waterBowl: BowlLatest | null;
};

export type ActivityBucket = {
  start: string;
  localDate: string;
  localHour: number | null;
  /** 0 = domingo */
  weekday: number;
  activeMinutes: number;
  intenseMinutes: number;
  avgIntensity: number;
  hasData: boolean;
  intense: boolean;
};

export type ActivityReport = {
  period: Period;
  hasDevice: boolean;
  hasData: boolean;
  from: string;
  to: string;
  activeMinutes: number;
  restMinutes: number;
  intenseMinutes: number;
  avgIntensity: number | null;
  variationPct: number | null;
  peak: { start: string; minutes: number } | null;
  buckets: ActivityBucket[];
  events: { kind: 'intense' | 'rest'; start: string; minutes: number }[];
};

export type ConsumptionReport = {
  kind: BowlKind;
  hasDevice: boolean;
  hasData: boolean;
  capacity: number;
  current: number | null;
  percent: number | null;
  lastReadingAt: string | null;
  dailyAverage: number | null;
  daily: { date: string; weekday: number; consumed: number; hasData: boolean }[];
  events: { kind: 'consumption' | 'refill'; at: string; amount: number }[];
};

export const readingService = {
  latest: (petId: string) => api<PetLatest>(`/pets/${petId}/readings/latest`, { auth: true }),

  activity: (petId: string, period: Period) =>
    api<ActivityReport>(`/pets/${petId}/readings/activity?period=${period}`, { auth: true }),

  consumption: (petId: string, kind: BowlKind) =>
    api<ConsumptionReport>(`/pets/${petId}/readings/consumption?kind=${kind}`, { auth: true }),
};
