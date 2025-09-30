// onboarding/components/profile-wizard/components/forms/PersonalDetailsForm.tsx
"use client";

import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import { PersonalFormField } from "./PersonalFormField";
import { GenderSelection } from "./GenderSelection";
import { BioTextarea } from "./BioTextarea";
import { DateOfBirthField } from "./DateOfBirthField";
import type { PersonalDetailsFormData, ValidationError } from "@/types/profile";

interface PersonalDetailsFormProps {
  readonly control: Control<PersonalDetailsFormData>;
  readonly errors: FieldErrors<PersonalDetailsFormData>;
  readonly storeErrors:  ValidationError[];
  readonly watchedValues: PersonalDetailsFormData;
}

export const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  control,
  errors,
  storeErrors,
  watchedValues,
}) => (
  <>
    {/* User Details Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PersonalFormField
        label="Username *"
        name="username"
        control={control}
        placeholder="Choose a username"
        error={errors.username}
        storeErrors={storeErrors}
        watchedValue={watchedValues.username}
        autoComplete="username"
        maxLength={130}
      />

      <PersonalFormField
        label="First Name *"
        name="firstName"
        control={control}
        placeholder="Your first name"
        error={errors.firstName}
        storeErrors={storeErrors}
        watchedValue={watchedValues.firstName}
        autoComplete="given-name"
        maxLength={150}
      />

      <PersonalFormField
        label="Last Name *"
        name="lastName"
        control={control}
        placeholder="Your last name"
        error={errors.lastName}
        storeErrors={storeErrors}
        watchedValue={watchedValues.lastName}
        autoComplete="family-name"
        maxLength={50}
      />
    </div>

    {/* Date of Birth */}
    <DateOfBirthField
      control={control}
      error={errors.dateOfBirth}
      watchedValue={watchedValues.dateOfBirth}
    />

    {/* Gender Selection */}
    <GenderSelection
      control={control}
      error={errors.gender}
      watchedValue={watchedValues.gender}
    />

    {/* Bio */}
    <BioTextarea
      control={control}
      error={errors.bio}
      watchedValue={watchedValues.bio}
    />
  </>
);
