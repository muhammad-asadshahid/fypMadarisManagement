import type { ProgramType, UserRole } from '@/types';

export interface NavItem {
  name: string;
  labelKey: string;
  icon: string;
  roles: UserRole[];
  /** Teachers only see this tab when assigned to a class of one of these program types. */
  teacherPrograms?: ProgramType[];
}

export const NAV_ITEMS: NavItem[] = [
  { name: 'index', labelKey: 'nav.dashboard', icon: 'view-dashboard', roles: ['admin', 'teacher', 'parent'] },
  { name: 'approvals', labelKey: 'nav.approvals', icon: 'clipboard-check', roles: ['admin'] },
  { name: 'students', labelKey: 'nav.students', icon: 'account-school', roles: ['admin'] },
  { name: 'classes', labelKey: 'nav.classes', icon: 'google-classroom', roles: ['admin'] },
  { name: 'teachers', labelKey: 'nav.teachers', icon: 'human-male-board', roles: ['admin'] },
  { name: 'attendance', labelKey: 'nav.attendance', icon: 'calendar-check', roles: ['admin', 'teacher'] },
  { name: 'hifz', labelKey: 'nav.hifz', icon: 'book-open-page-variant', roles: ['admin', 'teacher'], teacherPrograms: ['hifz_ul_quran'] },
  { name: 'nazra', labelKey: 'nav.nazra', icon: 'book-open-variant', roles: ['admin', 'teacher'], teacherPrograms: ['nazra_quran'] },
  { name: 'dars-e-nizami', labelKey: 'nav.darsENizami', icon: 'bookshelf', roles: ['admin', 'teacher'], teacherPrograms: ['dars_e_nizami'] },
  { name: 'asri-taleem', labelKey: 'nav.asriTaleem', icon: 'school', roles: ['admin', 'teacher'], teacherPrograms: ['asri_taleem'] },
  { name: 'hostel', labelKey: 'nav.hostel', icon: 'home-group', roles: ['admin'] },
  { name: 'financial', labelKey: 'nav.financial', icon: 'cash-multiple', roles: ['admin'] },
  { name: 'parent-portal', labelKey: 'nav.parentPortal', icon: 'account-child', roles: ['parent'] },
  { name: 'reports', labelKey: 'nav.reports', icon: 'file-chart', roles: ['admin'] },
  { name: 'settings', labelKey: 'nav.settings', icon: 'cog', roles: ['admin', 'teacher', 'parent'] },
];

export function getNavItemsForUser(
  role: UserRole,
  teacherPrograms: Set<ProgramType>,
): NavItem[] {
  return NAV_ITEMS.filter((item) => {
    if (!item.roles.includes(role)) return false;
    if (role === 'teacher' && item.teacherPrograms?.length) {
      return item.teacherPrograms.some((program) => teacherPrograms.has(program));
    }
    return true;
  });
}
