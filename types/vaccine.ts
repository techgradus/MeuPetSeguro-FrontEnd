export type VaccineStatus = 'Em dia' | 'Próxima do vencimento' | 'Atrasada';

export type Vaccine = {
  id: string;
  petId: string;
  name: string;
  appliedAt: string;   // ISO: aaaa-mm-dd
  nextDoseAt?: string; // ISO: aaaa-mm-dd
  status: VaccineStatus;
  notes?: string;
};

export type NewVaccineInput = Omit<Vaccine, 'id' | 'petId' | 'status'>;