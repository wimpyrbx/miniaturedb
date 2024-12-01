import type { FC } from 'react';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

const SidebarItem: FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  onClick,
  active = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
        active ? 'bg-gray-100 dark:bg-gray-800' : ''
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );
};

export default SidebarItem; 