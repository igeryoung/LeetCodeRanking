export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function ratingColor(rating: number): string {
  if (rating < 1200) return 'text-gray-500 dark:text-gray-400';
  if (rating < 1400) return 'text-green-600 dark:text-green-400';
  if (rating < 1600) return 'text-teal-600 dark:text-teal-400';
  if (rating < 1800) return 'text-blue-600 dark:text-blue-400';
  if (rating < 2000) return 'text-violet-600 dark:text-violet-400';
  if (rating < 2200) return 'text-yellow-600 dark:text-yellow-400';
  if (rating < 2400) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

export function ratingBg(rating: number): string {
  if (rating < 1200) return 'bg-gray-100 dark:bg-gray-800';
  if (rating < 1400) return 'bg-green-50 dark:bg-green-950/30';
  if (rating < 1600) return 'bg-teal-50 dark:bg-teal-950/30';
  if (rating < 1800) return 'bg-blue-50 dark:bg-blue-950/30';
  if (rating < 2000) return 'bg-violet-50 dark:bg-violet-950/30';
  if (rating < 2200) return 'bg-yellow-50 dark:bg-yellow-950/30';
  if (rating < 2400) return 'bg-orange-50 dark:bg-orange-950/30';
  return 'bg-red-50 dark:bg-red-950/30';
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
