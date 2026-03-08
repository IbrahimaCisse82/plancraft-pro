/** Shared types for business plan data */

export interface BusinessPlan {
  id: string;
  name: string;
  secteur: string | null;
  devise: string;
  statut: "brouillon" | "finalise" | "archive";
  progress: number;
  content: Record<string, any> | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type BPContent = Record<string, any>;
