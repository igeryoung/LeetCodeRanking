export type Language = 'en' | 'zh-TW';

export interface Translations {
  nav: { problems: string; dashboard: string; appName: string };
  table: { rating: string; id: string; problem: string; contest: string; status: string; problems: string; perPage: string; page: string; of: string; noResults: string };
  filter: { filters: string; rating: string; min: string; max: string; reset: string };
  status: { solved: string; attempted: string; todo: string; remove: string };
  dashboard: { title: string; subtitle: string; solved: string; attempted: string; todo: string; touched: string; ofTotal: (pct: number, total: number) => string; ratingDist: string };
  auth: { login: string; loginWith: (provider: string) => string; logout: string };
  notes: { title: string; save: string; cancel: string; placeholder: string };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      problems: 'Problems',
      dashboard: 'Dashboard',
      appName: 'LC Rating',
    },
    table: {
      rating: 'Rating',
      id: 'ID',
      problem: 'Problem',
      contest: 'Contest',
      status: 'Status',
      problems: 'problems',
      perPage: '/ page',
      page: 'Page',
      of: 'of',
      noResults: 'No problems found',
    },
    filter: {
      filters: 'Filters',
      rating: 'Rating',
      min: 'Min',
      max: 'Max',
      reset: 'Reset',
    },
    status: {
      solved: 'Solved',
      attempted: 'Attempted',
      todo: 'Todo',
      remove: 'Remove',
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Your LeetCode progress overview',
      solved: 'Solved',
      attempted: 'Attempted',
      todo: 'Todo',
      touched: 'Touched',
      ofTotal: (pct: number, total: number) => `${pct}% of ${total}`,
      ratingDist: 'Rating Distribution',
    },
    auth: {
      login: 'Sign in',
      loginWith: (provider: string) => `Continue with ${provider}`,
      logout: 'Sign out',
    },
    notes: {
      title: 'Notes',
      save: 'Save',
      cancel: 'Cancel',
      placeholder: 'Add your notes here...',
    },
  },
  'zh-TW': {
    nav: {
      problems: '題目',
      dashboard: '儀表板',
      appName: 'LC Rating',
    },
    table: {
      rating: '難度分',
      id: 'ID',
      problem: '題目',
      contest: '競賽',
      status: '狀態',
      problems: '道題目',
      perPage: '/ 頁',
      page: '第',
      of: '共',
      noResults: '找不到題目',
    },
    filter: {
      filters: '篩選',
      rating: '難度分',
      min: '最小',
      max: '最大',
      reset: '重置',
    },
    status: {
      solved: '已解決',
      attempted: '嘗試中',
      todo: '待完成',
      remove: '移除',
    },
    dashboard: {
      title: '儀表板',
      subtitle: '你的 LeetCode 進度總覽',
      solved: '已解決',
      attempted: '嘗試中',
      todo: '待完成',
      touched: '已接觸',
      ofTotal: (pct: number, total: number) => `佔 ${total} 道的 ${pct}%`,
      ratingDist: '難度分佈',
    },
    auth: {
      login: '登入',
      loginWith: (provider: string) => `使用 ${provider} 繼續`,
      logout: '登出',
    },
    notes: {
      title: '筆記',
      save: '儲存',
      cancel: '取消',
      placeholder: '在這裡新增你的筆記...',
    },
  },
};
