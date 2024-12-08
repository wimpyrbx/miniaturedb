import { IconChartBar, IconBuilding, IconMicroscope, IconTags, IconUser } from '@tabler/icons-react';
import type { SidebarLink } from '../types/sidebar';

export const sidebarLinks: SidebarLink[] = [
  {
    label: 'Dashboard',
    icon: IconChartBar,
    link: '/dashboard',
    color: 'blue'
  },
  {
    label: 'Miniatures',
    icon: IconMicroscope,
    link: '/miniatures',
    color: 'violet'
  },
  {
    label: 'Production',
    icon: IconBuilding,
    link: '/product-admin',
    color: 'green'
  },
  {
    label: 'Classification',
    icon: IconTags,
    link: '/classification-admin',
    color: 'orange'
  },
  {
    label: 'Profile',
    icon: IconUser,
    link: '/profile',
    color: 'grape'
  }
]; 