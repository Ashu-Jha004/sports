export interface ModeratorFormData {
  guideEmail: string;
  documents: string[];
  primarySports: string | undefined;
  sports: string[];
  experience: number | null;
  state: string;
  lat: number | null;
  lon: number | null;
  city: string;
  country: string;
}
