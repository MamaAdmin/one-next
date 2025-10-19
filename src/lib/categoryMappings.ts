export type CourseCategory = 'understand' | 'ideate' | 'decide' | 'prototype' | 'validate' | 'retrospect';

export const categoryLabels: Record<CourseCategory, string> = {
  understand: "Verstehen",
  ideate: "Ideen entwickeln",
  decide: "Entscheiden",
  prototype: "Prototyp",
  validate: "Validieren",
  retrospect: "Retrospektive",
};

export const categoryColors: Record<CourseCategory, string> = {
  understand: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ideate: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  decide: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  prototype: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  validate: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  retrospect: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

export const categoryOrder: CourseCategory[] = [
  'understand',
  'ideate', 
  'decide',
  'prototype',
  'validate',
  'retrospect'
];
