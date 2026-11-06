import type { AgeCategory } from '../types/marathon';

export function calculateAge(birthDateStr: string, referenceDateStr?: string): number {
  if (!birthDateStr) return 0;
  const birth = new Date(birthDateStr);
  const ref = referenceDateStr ? new Date(referenceDateStr) : new Date();

  if (isNaN(birth.getTime())) return 0;

  let age = ref.getFullYear() - birth.getFullYear();
  const monthDiff = ref.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) {
    age--;
  }

  return Math.max(0, age);
}

export function determineAgeCategory(age: number, categories?: AgeCategory[]): AgeCategory | null {
  if (!categories || categories.length === 0) return null;

  for (const cat of categories) {
    if (age >= cat.minAge && age <= cat.maxAge) {
      return cat;
    }
  }

  return null;
}

export const DEFAULT_ADULT_CATEGORIES: AgeCategory[] = [
  { id: 'cat-18-25', name: '18-25 лет', minAge: 18, maxAge: 25 },
  { id: 'cat-26-35', name: '26-35 лет', minAge: 26, maxAge: 35 },
  { id: 'cat-36-45', name: '36-45 лет', minAge: 36, maxAge: 45 },
  { id: 'cat-46-55', name: '46-55 лет', minAge: 46, maxAge: 55 },
  { id: 'cat-56-plus', name: '56+ лет', minAge: 56, maxAge: 99 },
];

export const DEFAULT_YOUTH_10K_CATEGORIES: AgeCategory[] = [
  { id: 'cat-15-17', name: '15-17 лет (Юниоры)', minAge: 15, maxAge: 17 },
  { id: 'cat-18-25', name: '18-25 лет', minAge: 18, maxAge: 25 },
  { id: 'cat-26-35', name: '26-35 лет', minAge: 26, maxAge: 35 },
  { id: 'cat-36-49', name: '36-49 лет', minAge: 36, maxAge: 49 },
  { id: 'cat-50-plus', name: '50+ лет', minAge: 50, maxAge: 99 },
];

export const DEFAULT_KIDS_CATEGORIES: AgeCategory[] = [
  { id: 'cat-7-10', name: '7-10 лет (Младшие)', minAge: 7, maxAge: 10 },
  { id: 'cat-11-14', name: '11-14 лет (Старшие)', minAge: 11, maxAge: 14 },
];
