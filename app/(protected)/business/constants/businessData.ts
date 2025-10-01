// constants/businessData.ts
import { BusinessOption, BusinessCategory } from "../types/business";

export const BUSINESS_OPTIONS: BusinessOption[] = [
  {
    id: "facilities",
    title: "Facility Management",
    description:
      "Rent out your gym, courts, or training facilities to fellow athletes",
    icon: "🏟️",
    route: "/business/facilities",
    features: [
      "List your facilities",
      "Manage bookings",
      "Set pricing & availability",
      "Track revenue",
    ],
    estimatedEarnings: {
      min: 500,
      max: 5000,
      period: "month",
    },
    requirements: [
      "Own or manage a facility",
      "Valid insurance coverage",
      "Safety certifications",
    ],
    difficulty: "Intermediate",
    category: BusinessCategory.FACILITIES,
  },
  {
    id: "services",
    title: "Professional Services",
    description:
      "Offer coaching, training, or evaluation services as a certified guide",
    icon: "👨‍🏫",
    route: "/business/services",
    features: [
      "Create service packages",
      "Manage client bookings",
      "Conduct evaluations",
      "Build your reputation",
    ],
    estimatedEarnings: {
      min: 1000,
      max: 8000,
      period: "month",
    },
    requirements: [
      "Relevant certifications",
      "Professional experience",
      "Background verification",
    ],
    difficulty: "Advanced",
    category: BusinessCategory.SERVICES,
  },
  {
    id: "marketplace",
    title: "Sports Marketplace",
    description:
      "Sell equipment, supplements, and sports products to the Sparta community",
    icon: "🛒",
    route: "/business/marketplace",
    features: [
      "List products for sale",
      "Manage inventory",
      "Process orders",
      "Customer reviews",
    ],
    estimatedEarnings: {
      min: 300,
      max: 3000,
      period: "month",
    },
    requirements: [
      "Product inventory",
      "Business license (if required)",
      "Shipping capabilities",
    ],
    difficulty: "Beginner",
    category: BusinessCategory.MARKETPLACE,
  },
];
