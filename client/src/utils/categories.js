import { BookOpen, Briefcase, Dumbbell, User, Heart, Code, Music, Sparkles, Coffee, Flame } from 'lucide-react';

export const ICON_MAP = {
  BookOpen,
  Briefcase,
  Dumbbell,
  User,
  Heart,
  Code,
  Music,
  Sparkles,
  Coffee,
  Flame,
};

export const DEFAULT_CATEGORIES = [
  { id: 'education', label: 'Education', icon: 'BookOpen', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
  { id: 'work', label: 'Work', icon: 'Briefcase', color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
  { id: 'fitness', label: 'Fitness', icon: 'Dumbbell', color: 'text-green-500 bg-green-100 dark:bg-green-900/30' },
  { id: 'personal', label: 'Personal', icon: 'User', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
];

export const getCategories = () => {
  try {
    const saved = localStorage.getItem('planme_categories');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_CATEGORIES;
};

export const saveCategories = (cats) => {
  localStorage.setItem('planme_categories', JSON.stringify(cats.slice(0, 6)));
};