import { BookOpen, Zap, Target, Heart, Shield } from "lucide-react";

export interface InstructionContent {
  title: string;
  subtitle: string;
  icon: any;
  estimatedTime: string;
  instructions: string[];
  tips: string[];
  equipment: string[];
  safetyNotes?: string[];
}

export const wizardInstructions: Record<string, InstructionContent> = {
  basicMetrics: {
    title: "Basic Physical Measurements",
    subtitle: "Essential body composition metrics using everyday equipment",
    icon: BookOpen,
    estimatedTime: "10-15 minutes",
    instructions: [
      "**Height Measurement**: Have athlete stand straight against a wall without shoes. Place a book flat against the top of their head, mark the wall, and measure from floor to mark using a measuring tape.",
      "**Weight Measurement**: Use a standard bathroom scale on a flat, hard surface. Weigh at the same time each day for consistency. Athlete should wear minimal clothing.",
      "**Age Calculation**: Calculate exact age from birth date or ask athlete directly. Record in completed years.",
      "**Body Fat Estimation**: Use body fat calipers on 3 sites (tricep, suprailiac, thigh) and apply Jackson-Pollock formula, or use bioelectrical impedance scale if available.",
    ],
    tips: [
      "Take all measurements 2-3 times and use the average for accuracy",
      "Record all measurements in metric units (cm, kg, %)",
      "Ensure athlete is properly hydrated for body fat measurement",
      "Measure height without shoes and weight in minimal clothing",
    ],
    equipment: [
      "Measuring tape (at least 2 meters)",
      "Bathroom scale (digital preferred)",
      "Body fat calipers or bioelectrical impedance scale",
      "Flat book or ruler for height marking",
    ],
  },

  strengthPower: {
    title: "Strength & Power Assessment",
    subtitle:
      "Measure functional strength using bodyweight and basic equipment",
    icon: Zap,
    estimatedTime: "20-25 minutes",
    instructions: [
      "**Overall Strength Score**: Combine maximum push-ups (1 minute), maximum pull-ups, and wall-sit duration. Formula: (push-ups × 0.4) + (pull-ups × 2) + (wall-sit seconds × 0.1)",
      "**Muscle Mass Assessment**: Visual assessment combined with arm circumference (bicep flexed) and thigh circumference measurements using measuring tape.",
      "**Endurance Strength**: Record plank hold duration (seconds) and maximum squats in 2 minutes. Combine scores: (plank seconds × 0.5) + (squats × 0.3)",
      "**Explosive Power**: Vertical jump height using wall + chalk method and standing broad jump distance. Average both measurements and scale to 0-100.",
    ],
    tips: [
      "Allow proper 5-10 minute warm-up before all strength testing",
      "Use consistent timing methods (stopwatch or phone timer)",
      "Ensure proper form for all exercises to prevent injury",
      "Rest 2-3 minutes between different strength tests",
    ],
    equipment: [
      "Stopwatch or phone timer",
      "Pull-up bar or sturdy overhead bar",
      "Measuring tape for circumference and jump distance",
      "Chalk for vertical jump marking",
      "Flat wall space for wall-sit and vertical jump",
    ],
    safetyNotes: [
      "Stop any test if athlete experiences pain or dizziness",
      "Ensure proper form over maximum repetitions",
      "Have spotter available for pull-up testing",
    ],
  },

  speedAgility: {
    title: "Speed & Agility Assessment",
    subtitle: "Test explosive movement and coordination abilities",
    icon: Target,
    estimatedTime: "15-20 minutes",
    instructions: [
      "**Sprint Speed**: 40-meter sprint time using stopwatch. Start from standing position, time from first movement to finish line crossing.",
      "**Acceleration**: 10-meter sprint time from standing start. Measure explosive start capability and initial acceleration phase.",
      "**Agility Test**: T-drill using cones - sprint forward 10m, shuffle left 5m, shuffle right 10m, shuffle left 5m, backpedal to start. Record total time.",
      "**Reaction Time**: Simple light/sound reaction test using smartphone app or have athlete respond to visual/audio cues.",
      "**Balance Assessment**: Single-leg stand with eyes closed. Record maximum hold time for each leg, use better score.",
      "**Coordination Test**: Ball bounce and catch while standing on one foot. Count successful catches in 30 seconds per leg.",
    ],
    tips: [
      "Use consistent surface and conditions for all speed tests",
      "Allow full recovery (3-5 minutes) between maximum effort tests",
      "Practice the movements once before recording official times",
      "Test in optimal conditions (dry surface, minimal wind)",
    ],
    equipment: [
      "Stopwatch (preferably two for backup timing)",
      "Measuring tape for distance marking",
      "4-6 training cones or markers",
      "Tennis ball or similar for coordination test",
      "Smartphone with reaction time app (optional)",
    ],
  },

  staminaRecovery: {
    title: "Stamina & Recovery Assessment",
    subtitle: "Evaluate cardiovascular fitness and recovery capacity",
    icon: Heart,
    estimatedTime: "25-30 minutes",
    instructions: [
      "**VO2 Max Estimation**: 12-minute Cooper run test. Measure maximum distance covered in exactly 12 minutes. Formula: VO2 Max = (distance in meters - 504.9) ÷ 44.73",
      "**Flexibility Assessment**: Sit-and-reach test using a box or step. Measure maximum forward reach past toes in centimeters. Take best of 3 attempts.",
      "**Recovery Time**: After 3-minute step test (24 steps per minute), measure heart rate recovery. Record time to return to resting heart rate +20 bpm.",
      "**Resting Heart Rate**: Measure pulse for 60 seconds while athlete is completely at rest (sitting quietly for 5+ minutes).",
    ],
    tips: [
      "Ensure athlete is well-rested before cardiovascular testing",
      "Monitor heart rate throughout recovery testing",
      "Allow proper warm-up for flexibility testing",
      "Conduct tests in comfortable temperature conditions",
    ],
    equipment: [
      "Stopwatch for timing runs and recovery",
      "Measuring wheel or GPS app for distance measurement",
      "Heart rate monitor or manual pulse counting",
      "Box or step (30cm height) for step test",
      "Measuring ruler for sit-and-reach test",
    ],
    safetyNotes: [
      "Stop cardiovascular tests if athlete shows signs of distress",
      "Have water available during endurance testing",
      "Monitor for dizziness or nausea during recovery",
    ],
  },

  injuries: {
    title: "Injury Assessment & Documentation",
    subtitle: "Record current and past injuries affecting performance",
    icon: Shield,
    estimatedTime: "10-15 minutes",
    instructions: [
      "**Current Active Injuries**: Document any ongoing injuries, pain, or physical limitations currently affecting the athlete.",
      "**Recent Injuries**: Record injuries from the past 6 months that may still impact performance or require ongoing management.",
      "**Chronic/Recurring Issues**: Identify any long-term or repeatedly occurring injury patterns that affect training or performance.",
      "**Injury Details**: For each injury, record type, affected body part, severity level, occurrence date, and current status.",
      "**Recovery Progress**: Note any ongoing treatment, expected recovery time, and current functional limitations.",
      "**Pain Assessment**: Use 1-10 scale for current pain levels and document how injuries affect daily activities and sports performance.",
    ],
    tips: [
      "Be thorough - even minor issues can affect performance measurement",
      "Ask about pain during specific movements or positions",
      "Document any modifications needed for testing due to injuries",
      "Note if athlete is cleared by medical professionals for full activity",
    ],
    equipment: [
      "Injury documentation forms",
      "Pain scale reference chart (1-10)",
      "Camera for documenting visible injuries (with consent)",
      "Contact information for athlete's medical providers",
    ],
    safetyNotes: [
      "Never provide medical advice or treatment recommendations",
      "Refer to qualified medical professionals for injury evaluation",
      "Modify or skip tests that could aggravate existing injuries",
    ],
  },
};
