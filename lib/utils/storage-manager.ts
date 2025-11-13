// ============================================
// FILE: utils/storage-manager.ts
// Safe localStorage operations with error handling
// ============================================

import type { WizardFormData } from "@/types/wizard.types";
import { STORAGE_KEYS } from "@/types/config/wizard.config";

interface StoredDraft {
  formData: WizardFormData;
  savedAt: string;
}

/**
 * Safe localStorage operations with error handling
 */
export class StorageManager {
  /**
   * Save draft to localStorage
   */
  static saveDraft(userId: string, formData: WizardFormData): boolean {
    try {
      const draftKey = `${STORAGE_KEYS.DRAFT_PREFIX}${userId}`;
      const draftData: StoredDraft = {
        formData,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(draftKey, JSON.stringify(draftData));
      console.log("💾 Draft saved to localStorage");
      return true;
    } catch (error) {
      // Handle QuotaExceededError or other storage errors
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        console.error("❌ Storage quota exceeded. Cannot save draft.");
      } else {
        console.error("❌ Failed to save draft:", error);
      }
      return false;
    }
  }

  /**
   * Load draft from localStorage
   */
  static loadDraft(userId: string): StoredDraft | null {
    try {
      const draftKey = `${STORAGE_KEYS.DRAFT_PREFIX}${userId}`;
      const stored = localStorage.getItem(draftKey);

      if (!stored) return null;

      const parsed = JSON.parse(stored) as StoredDraft;

      // Validate structure
      if (!parsed.formData || !parsed.savedAt) {
        console.warn("⚠️ Invalid draft structure, clearing...");
        this.clearDraft(userId);
        return null;
      }

      return parsed;
    } catch (error) {
      console.error("❌ Failed to load draft:", error);
      return null;
    }
  }

  /**
   * Clear draft from localStorage
   */
  static clearDraft(userId: string): void {
    try {
      const draftKey = `${STORAGE_KEYS.DRAFT_PREFIX}${userId}`;
      localStorage.removeItem(draftKey);
      console.log("🗑️ Draft cleared from localStorage");
    } catch (error) {
      console.error("❌ Failed to clear draft:", error);
    }
  }

  /**
   * Check if draft exists
   */
  static hasDraft(userId: string): boolean {
    try {
      const draftKey = `${STORAGE_KEYS.DRAFT_PREFIX}${userId}`;
      return localStorage.getItem(draftKey) !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get draft age in milliseconds
   */
  static getDraftAge(userId: string): number | null {
    const draft = this.loadDraft(userId);
    if (!draft) return null;

    const savedAt = new Date(draft.savedAt);
    const now = new Date();
    return now.getTime() - savedAt.getTime();
  }
}
