// lib/constants/index.ts

// Sports Data with Categories and Metadata
export interface Sport {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  popularity: number;
}

export const SPORT_CATEGORIES = [
  "All Sports",
  "Team Sports",
  "Individual Sports",
  "Water Sports",
  "Combat Sports",
  "Racket Sports",
  "Winter Sports",
  "Other",
] as const;

export const SPORTS_DATA: Sport[] = [
  {
    id: "soccer",
    name: "Soccer",
    category: "Team Sports",
    icon: "⚽",
    description: "The world's most popular sport",
    popularity: 10,
  },
  {
    id: "basketball",
    name: "Basketball",
    category: "Team Sports",
    icon: "🏀",
    description: "Fast-paced team sport with high scoring",
    popularity: 9,
  },
  {
    id: "football",
    name: "Football",
    category: "Team Sports",
    icon: "🏈",
    description: "American football with strategic gameplay",
    popularity: 9,
  },
  {
    id: "baseball",
    name: "Baseball",
    category: "Team Sports",
    icon: "⚾",
    description: "Classic American pastime",
    popularity: 8,
  },
  {
    id: "volleyball",
    name: "Volleyball",
    category: "Team Sports",
    icon: "🏐",
    description: "Dynamic net sport played indoors or on beach",
    popularity: 7,
  },
  {
    id: "running",
    name: "Running",
    category: "Individual Sports",
    icon: "🏃",
    description: "Endurance sport from sprints to marathons",
    popularity: 9,
  },
  {
    id: "cycling",
    name: "Cycling",
    category: "Individual Sports",
    icon: "🚴",
    description: "Road, mountain, or track cycling",
    popularity: 8,
  },
  {
    id: "swimming",
    name: "Swimming",
    category: "Water Sports",
    icon: "🏊",
    description: "Competitive swimming in pools or open water",
    popularity: 8,
  },
  {
    id: "tennis",
    name: "Tennis",
    category: "Racket Sports",
    icon: "🎾",
    description: "Precision racket sport for singles or doubles",
    popularity: 8,
  },
  {
    id: "golf",
    name: "Golf",
    category: "Individual Sports",
    icon: "⛳",
    description: "Precision sport played on courses",
    popularity: 7,
  },
  {
    id: "boxing",
    name: "Boxing",
    category: "Combat Sports",
    icon: "🥊",
    description: "Combat sport using fists",
    popularity: 7,
  },
  {
    id: "martial-arts",
    name: "Martial Arts",
    category: "Combat Sports",
    icon: "🥋",
    description: "Various fighting disciplines and techniques",
    popularity: 7,
  },
  {
    id: "skiing",
    name: "Skiing",
    category: "Winter Sports",
    icon: "⛷️",
    description: "Alpine or cross-country skiing",
    popularity: 6,
  },
  {
    id: "gymnastics",
    name: "Gymnastics",
    category: "Individual Sports",
    icon: "🤸",
    description: "Artistic sport requiring strength and flexibility",
    popularity: 6,
  },
  {
    id: "other",
    name: "Other",
    category: "Other",
    icon: "🏆",
    description: "Sport not listed above",
    popularity: 3,
  },
];

// Popular Countries for Location Selection
export interface CountryOption {
  name: string;
  code: string;
}

export const POPULAR_COUNTRIES: CountryOption[] = [
  { name: "United States", code: "US" },
  { name: "Canada", code: "CA" },
  { name: "United Kingdom", code: "GB" },
  { name: "Australia", code: "AU" },
  { name: "Germany", code: "DE" },
  { name: "France", code: "FR" },
  { name: "Italy", code: "IT" },
  { name: "Spain", code: "ES" },
  { name: "Brazil", code: "BR" },
  { name: "Mexico", code: "MX" },
  { name: "India", code: "IN" },
  { name: "China", code: "CN" },
  { name: "Japan", code: "JP" },
  { name: "South Korea", code: "KR" },
  { name: "Netherlands", code: "NL" },
];

// Gender Options
export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;

// Rank System
export type RankType = "KING" | "QUEEN" | "ROOK" | "BISHOP" | "KNIGHT" | "PAWN";

export interface RankInfo {
  emoji: string;
  color: string;
  label: string;
}

export const RANK_INFO: Record<RankType, RankInfo> = {
  KING: {
    emoji: "👑",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    label: "King",
  },
  QUEEN: {
    emoji: "👸",
    color: "text-purple-600 bg-purple-50 border-purple-200",
    label: "Queen",
  },
  ROOK: {
    emoji: "🏰",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    label: "Rook",
  },
  BISHOP: {
    emoji: "⛪",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    label: "Bishop",
  },
  KNIGHT: {
    emoji: "🐎",
    color: "text-green-600 bg-green-50 border-green-200",
    label: "Knight",
  },
  PAWN: {
    emoji: "♟️",
    color: "text-gray-600 bg-gray-50 border-gray-200",
    label: "Pawn",
  },
};

// Class System
export type ClassType = "A" | "B" | "C" | "D" | "E";

export interface ClassInfo {
  color: string;
  label: string;
}

export const CLASS_INFO: Record<ClassType, ClassInfo> = {
  A: {
    color: "text-red-600 bg-red-50 border-red-200",
    label: "Elite",
  },
  B: {
    color: "text-orange-600 bg-orange-50 border-orange-200",
    label: "Advanced",
  },
  C: {
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    label: "Intermediate",
  },
  D: {
    color: "text-blue-600 bg-blue-50 border-blue-200",
    label: "Beginner",
  },
  E: {
    color: "text-gray-600 bg-gray-50 border-gray-200",
    label: "Novice",
  },
};

// Notification Types
export const NOTIFICATION_TYPE_CONFIG = {
  FOLLOW: { icon: "👥", color: "text-blue-600" },
  LIKE: { icon: "❤️", color: "text-red-600" },
  COMMENT: { icon: "💬", color: "text-green-600" },
  MESSAGE: { icon: "📩", color: "text-purple-600" },
  STAT_UPDATE_REQUEST: { icon: "📊", color: "text-orange-600" },
  STAT_UPDATE_APPROVED: { icon: "✅", color: "text-green-600" },
  STAT_UPDATE_DENIED: { icon: "❌", color: "text-red-600" },
  FRIEND_REQUEST: { icon: "👋", color: "text-blue-600" },
  JOIN_REQUEST: { icon: "🚪", color: "text-indigo-600" },
  TEAM_INVITE: { icon: "🏆", color: "text-yellow-600" },
  TEAM_EXPIRING: { icon: "⏰", color: "text-orange-600" },
  MEMBER_JOINED: { icon: "👋", color: "text-green-600" },
  MEMBER_LEFT: { icon: "👋", color: "text-gray-600" },
  ROLE_CHANGED: { icon: "🔄", color: "text-blue-600" },
  MENTION: { icon: "@", color: "text-purple-600" },
  STAT_UPDATE_PERMISSION: { icon: "🔐", color: "text-orange-600" },
} as const;

// Wizard Step Information
export const WIZARD_STEPS = {
  LOCATION: {
    id: 1,
    title: "Location",
    description:
      "Enter your location details including city, country, and state.",
  },
  PERSONAL_DETAILS: {
    id: 2,
    title: "Personal Details",
    description:
      "Provide your personal information such as date of birth and bio.",
  },
  PRIMARY_SPORT: {
    id: 3,
    title: "Primary Sport",
    description: "Select your primary sport from the available options.",
  },
  GEOLOCATION: {
    id: 4,
    title: "Geolocation",
    description:
      "Allow location access to automatically detect your coordinates.",
  },
  REVIEW_SUBMIT: {
    id: 5,
    title: "Review & Submit",
    description: "Review all information and submit your profile.",
  },
} as const;

// Popularity Stars Helper
export const getPopularityStars = (popularity: number): string => {
  return "⭐".repeat(Math.min(Math.max(Math.round(popularity / 2), 1), 5));
};

// Sport Icon Helper
export const getSportIcon = (sportName: string): string => {
  const sport = SPORTS_DATA.find(
    (s) => s.name.toLowerCase() === sportName.toLowerCase()
  );
  return sport?.icon || "🏆";
};

// Default Values and Validation Constants
export const DEFAULT_VALUES = {
  IMAGE_MAX_SIZE_MB: 5,
  IMAGE_ALLOWED_FORMATS: ["jpeg", "jpg", "png", "webp"] as const,
  BIO_MIN_LENGTH: 10,
  BIO_MAX_LENGTH: 500,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 130,
  NAME_MAX_LENGTH: 150,
  LOCATION_MAX_LENGTH: 50,
  MIN_AGE: 13,
  MAX_AGE: 100,
} as const;
