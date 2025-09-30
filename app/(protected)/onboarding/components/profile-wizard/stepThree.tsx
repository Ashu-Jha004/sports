// onboarding/components/profile-wizard/stepThree.tsx
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
import { TrophyIcon } from "@heroicons/react/24/outline";

import { StepContainer } from "./components/forms/StepContainer";
import { ValidationStatus } from "./components/forms/ValidationStatus";
import { SportSearchBar } from "./components/sports/SportSearchBar";
import { CategoryFilter } from "./components/sports/CategoryFilter";
import { SelectedSportDisplay } from "./components/sports/SelectedSportDisplay";
import { SportGrid } from "./components/sports/SportGrid";
import { SportBenefitsInfo } from "./components/sports/SportBenefitsInfo";

import {
  useSportValidation,
  filterSports,
  SPORT_BENEFITS_INFO,
} from "@/lib/utils/sport-selection";
import { SPORTS_DATA } from "@/lib/constants/index";

import type { PrimarySportFormData } from "@/types/profile";

/**
 * =============================================================================
 * STEP THREE - PRIMARY SPORT SELECTION
 * =============================================================================
 */

export const StepThree: React.FC = () => {
  const formData:any = useFormData();
  const storeErrors:any = useErrors();
  const setFormData = useSetFormData();
  const setStepValid = useSetStepValid();
  const setStepCompleted = useSetStepCompleted();
  const clearErrors = useClearErrors();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Sports");
  const [showCategories, setShowCategories] = useState(false);

  // Prevent infinite updates
  const lastSelectedSport = useRef<string>("");

  // Form setup
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

  const primarySport = watch("primarySport");

  // Custom validation hook
  const { updateStepStatus } = useSportValidation({
    setFormData,
    setStepValid,
    setStepCompleted,
    clearErrors,
    lastSelectedSport,
  });

  // Filtered sports based on search and category
  const filteredSports = useMemo(
    () => filterSports(SPORTS_DATA, searchTerm, selectedCategory),
    [searchTerm, selectedCategory]
  );

  // Get selected sport details
  const selectedSport = useMemo(
    () => SPORTS_DATA.find((sport) => sport.name === primarySport),
    [primarySport]
  );

  // Handle step validation
  useEffect(() => {
    updateStepStatus(primarySport || "");
  }, [primarySport, updateStepStatus]);

  // Sport selection handler
  const handleSportSelect = useCallback(
    (sportName: string) => {
      setValue("primarySport", sportName, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue]
  );

  return (
    <StepContainer
      icon={<TrophyIcon className="w-8 h-8 text-yellow-600" />}
      title="What's your primary sport?"
      description="Choose the sport you're most passionate about or actively participate in"
      className="max-w-4xl"
    >
      <form noValidate>
        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          <SportSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <CategoryFilter
            selectedCategory={selectedCategory}
            showCategories={showCategories}
            onCategoryChange={setSelectedCategory}
            onToggleCategories={() => setShowCategories(!showCategories)}
          />
        </div>

        {/* Selected Sport Display */}
        {selectedSport && (
          <SelectedSportDisplay sport={selectedSport} className="mb-6" />
        )}

        {/* Sports Grid */}
        <Controller
          name="primarySport"
          control={control}
          render={({ field }) => (
            <SportGrid
              sports={filteredSports}
              selectedSport={field.value}
              onSportSelect={handleSportSelect}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              onClearFilters={() => {
                setSearchTerm("");
                setSelectedCategory("All Sports");
              }}
            />
          )}
        />

        {/* Validation Status */}
        <ValidationStatus
          isValidating={false}
          isValid={!!primarySport}
          isDirty={!!primarySport}
          successMessage="Primary sport selected!"
        />

        {/* Error Display */}
        {(errors.primarySport ||
          storeErrors.some((e:any) => e.field === "primarySport")) && (
          <div className="mt-4 text-center text-red-600 text-sm">
            {errors.primarySport?.message ||
              storeErrors.find((e:any) => e.field === "primarySport")?.message}
          </div>
        )}
      </form>

      {/* Sport Benefits Info */}
      <SportBenefitsInfo benefits={SPORT_BENEFITS_INFO} />
    </StepContainer>
  );
};

export default StepThree;
