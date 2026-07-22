import type { UserRole } from '@/types';

export interface NavItem {
  name: string;
  labelKey: string;
  icon: string;
  roles: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { name: 'index', labelKey: 'nav.dashboard', icon: 'view-dashboard', roles: ['admin', 'teacher', 'parent'] },
  { name: 'students', labelKey: 'nav.students', icon: 'account-school', roles: ['admin'] },
  { name: 'teachers', labelKey: 'nav.teachers', icon: 'human-male-board', roles: ['admin'] },
  { name: 'attendance', labelKey: 'nav.attendance', icon: 'calendar-check', roles: ['admin', 'teacher'] },
  { name: 'hifz', labelKey: 'nav.hifz', icon: 'book-open-page-variant', roles: ['admin', 'teacher'] },
  { name: 'nazra', labelKey: 'nav.nazra', icon: 'book-open-variant', roles: ['admin', 'teacher'] },
  { name: 'dars-e-nizami', labelKey: 'nav.darsENizami', icon: 'bookshelf', roles: ['admin', 'teacher'] },
  { name: 'asri-taleem', labelKey: 'nav.asriTaleem', icon: 'school', roles: ['admin', 'teacher'] },
  { name: 'hostel', labelKey: 'nav.hostel', icon: 'home-group', roles: ['admin'] },
  { name: 'financial', labelKey: 'nav.financial', icon: 'cash-multiple', roles: ['admin'] },
  { name: 'parent-portal', labelKey: 'nav.parentPortal', icon: 'account-child', roles: ['parent'] },
  { name: 'reports', labelKey: 'nav.reports', icon: 'file-chart', roles: ['admin'] },
  { name: 'settings', labelKey: 'nav.settings', icon: 'cog', roles: ['admin', 'teacher', 'parent'] },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
