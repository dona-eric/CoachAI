export interface SessionLog {
  id: string;
  date: string;
  planId?: string;
  planName?: string;
  duration: number;
  calories: number;
  exercisesDone: number;
  totalSets: number;
  mood: 1 | 2 | 3 | 4 | 5;
}
