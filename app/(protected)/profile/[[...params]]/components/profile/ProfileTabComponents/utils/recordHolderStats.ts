// recordHolderStats.ts

export type AthleteStats = {
  strength: number;
  power: number;
  speed: number;
  agility: number;
  recovery: number;
  stamina: number;
};

export const recordHolderStats: AthleteStats = {
  strength: 100, // e.g. Hafthor Bjornsson max composite strength
  power: 100, // e.g. explosiveness top score
  speed: 100, // Usain Bolt top speed normalized
  agility: 100, // Simone Biles agility benchmark
  recovery: 100, // Elite recovery score
  stamina: 100, // Eliud Kipchoge endurance benchmark
};
