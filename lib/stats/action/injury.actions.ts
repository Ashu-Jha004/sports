// ============================================
// FILE: actions/injury.actions.ts
// Injury management actions
// ============================================

import type { InjuryInput } from "@/types/wizard.types";
import { getDefaultInjury } from "@/types/config/wizard.config";
import { validateInjury } from "../validators/injury.validator";


export function createInjuryActions(
getState: () => any,
setState: (partial: any) => void,
autoSave: () => Promise<void>
) {
return {
/*

Update entire injuries array
*/
updateInjuries: (injuries: InjuryInput[]): void => {
setState({
formData: {
...getState().formData,
injuries,
},
isDraftSaved: false,
});

console.log(`📝 Updated injuries array (${injuries.length} injuries)`);
autoSave();
},

/**

Add new injury
*/
addInjury: (): void => {
const state = getState();
const newInjury = getDefaultInjury();

setState({
formData: {
...state.formData,
injuries: [...state.formData.injuries, newInjury],
},
isDraftSaved: false,
});

console.log("➕ Added new injury");
},

/**

Remove injury by index
*/
removeInjury: (index: number): void => {
const state = getState();
const injuries = state.formData.injuries;

if (index < 0 || index >= injuries.length) {
console.error(`❌ Invalid injury index: ${index}`);
return;
}

const updatedInjuries = injuries.filter((_: any, i: number) => i !== index);

setState({
formData: {
...state.formData,
injuries: updatedInjuries,
},
isDraftSaved: false,
});

console.log(`🗑️ Removed injury at index ${index}`);
autoSave();
},

/**

Update specific injury
*/
updateInjury: (index: number, injuryData: Partial<InjuryInput>): void => {
const state = getState();
const injuries = state.formData.injuries;

if (index < 0 || index >= injuries.length) {
console.error(`❌ Invalid injury index: ${index}`);
return;
}

const updatedInjury = { ...injuries[index], ...injuryData };

// Validate updated injury
const validationError = validateInjury(updatedInjury);
if (validationError) {
console.warn("⚠️ Injury validation warning:", validationError.message);
// Still update but log the warning
}

const updatedInjuries = injuries.map((injury: InjuryInput, i: number) =>
i === index ? updatedInjury : injury
);

setState({
formData: {
...state.formData,
injuries: updatedInjuries,
},
isDraftSaved: false,
});

console.log(`📝 Updated injury at index ${index}`);
autoSave();
},
};
}