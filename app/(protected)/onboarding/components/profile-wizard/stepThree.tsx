"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useFormData,
  useErrors,
  useSetFormData,
  useSetStepValid,
  useSetStepCompleted,
  useClearErrors,
} from "@/store/profileWizardStore";
import { primarySportSchema } from "@/lib/validations";
import { getFieldError } from "@/lib/validations";
import {
  TrophyIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface PrimarySportFormData {
  primarySport: string;
}

interface Sport {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  popularity: number;
}

const SPORT_CATEGORIES = [
  "All Sports",
  "Team Sports",
  "Individual Sports",
  "Water Sports",
  "Combat Sports",
  "Racket Sports",
  "Winter Sports",
  "Other",
] as const;

const SPORTS_DATA: Sport[] = [
  // Most Popular Team Sports
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

  // Most Popular Individual Sports
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

  // Popular Combat & Winter Sports
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

  // Other
  {
    id: "other",
    name: "Other",
    category: "Other",
    icon: "🏆",
    description: "Sport not listed above",
    popularity: 3,
  },
];

export const StepThree: React.FC = () => {
  const formData = useFormData();
  const storeErrors = useErrors();
  const setFormData = useSetFormData();
  const setStepValid = useSetStepValid();
  const setStepCompleted = useSetStepCompleted();
  const clearErrors = useClearErrors();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Sports");
  const [showCategories, setShowCategories] = useState(false);

  // FIXED: Use ref to prevent infinite updates
  const lastSelectedSport = useRef<string>("");

  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PrimarySportFormData>({
    resolver: zodResolver(primarySportSchema),
    defaultValues: {
      primarySport: formData.primarySport || "",
    },
    mode: "onChange",
  });

  // FIXED: Only watch the specific field we need
  const primarySport = watch("primarySport");

  // Filter sports based on search and category
  const filteredSports = useMemo(() => {
    let filtered = SPORTS_DATA;

    if (selectedCategory !== "All Sports") {
      filtered = filtered.filter(
        (sport) => sport.category === selectedCategory
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (sport) =>
          sport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sport.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => b.popularity - a.popularity);
  }, [searchTerm, selectedCategory]);

  // Get selected sport details
  const selectedSport = SPORTS_DATA.find(
    (sport) => sport.name === primarySport
  );

  // FIXED: Stable functions with useCallback to prevent infinite loops
  const updateStepStatus = useCallback(
    (sportName: string) => {
      // Prevent unnecessary updates
      if (lastSelectedSport.current === sportName) return;

      lastSelectedSport.current = sportName;

      if (sportName) {
        setFormData({ primarySport: sportName });
        setStepValid(3, true);
        setStepCompleted(3, true);
        clearErrors("primarySport");
      } else {
        setStepValid(3, false);
        setStepCompleted(3, false);
      }
    },
    [setFormData, setStepValid, setStepCompleted, clearErrors]
  );

  // FIXED: Effect with proper dependencies
  useEffect(() => {
    updateStepStatus(primarySport || "");
  }, [primarySport, updateStepStatus]);

  // FIXED: Simple sport selection
  const handleSportSelect = useCallback(
    (sport: Sport) => {
      setValue("primarySport", sport.name, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue]
  );

  const getSportCardClasses = useCallback(
    (sport: Sport) => {
      const isSelected = primarySport === sport.name;
      const baseClasses =
        "relative p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md";

      if (isSelected) {
        return `${baseClasses} border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200`;
      }

      return `${baseClasses} border-gray-200 bg-white hover:border-gray-300`;
    },
    [primarySport]
  );

  const getPopularityStars = useCallback((popularity: number) => {
    return "⭐".repeat(Math.min(Math.max(Math.round(popularity / 2), 1), 5));
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <TrophyIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            What's your primary sport?
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Choose the sport you're most passionate about or actively
            participate in
          </p>
        </div>

        <form noValidate>
          {/* Search and Filter Controls */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a sport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <FunnelIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Categories</span>
              </button>

              {showCategories && (
                <div className="flex flex-wrap gap-2 w-full">
                  {SPORT_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${
                        selectedCategory === category
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Sport Display */}
          {selectedSport && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{selectedSport.icon}</span>
                <div>
                  <h3 className="font-semibold text-blue-900">
                    {selectedSport.name}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {selectedSport.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-blue-600">Popularity:</span>
                    <span className="text-sm">
                      {getPopularityStars(selectedSport.popularity)}
                    </span>
                  </div>
                </div>
                <CheckCircleIcon className="w-6 h-6 text-blue-600 ml-auto" />
              </div>
            </div>
          )}

          {/* Sports Grid */}
          <Controller
            name="primarySport"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredSports.map((sport) => (
                  <div
                    key={sport.id}
                    className={getSportCardClasses(sport)}
                    onClick={() => handleSportSelect(sport)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl flex-shrink-0">
                        {sport.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {sport.name}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {sport.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {sport.category}
                          </span>
                          <span className="text-sm">
                            {getPopularityStars(sport.popularity)}
                          </span>
                        </div>
                      </div>
                      {field.value === sport.name && (
                        <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          />

          {/* No Results Message */}
          {filteredSports.length === 0 && (
            <div className="text-center py-12">
              <TrophyIcon className="mx-auto w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No sports found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or category filter
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All Sports");
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Error Messages */}
          {errors.primarySport && (
            <div className="flex items-center space-x-2 text-red-600 text-sm mb-4">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>{errors.primarySport.message}</span>
            </div>
          )}
          {getFieldError(storeErrors, "primarySport") && (
            <div className="flex items-center space-x-2 text-red-600 text-sm mb-4">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>{getFieldError(storeErrors, "primarySport")}</span>
            </div>
          )}

          {/* Success Message */}
          {primarySport && (
            <div className="flex items-center justify-center py-2 text-green-600">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">
                Primary sport selected!
              </span>
            </div>
          )}
        </form>

        {/* Sport Benefits Info */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="text-sm font-semibold text-yellow-800 mb-2">
            Why choose a primary sport?
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Get personalized training recommendations</li>
            <li>• Connect with athletes in your sport</li>
            <li>• Receive sport-specific content and tips</li>
            <li>• Find local competitions and events</li>
            <li>• Track progress with relevant metrics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
