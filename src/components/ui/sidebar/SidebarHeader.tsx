import type { FC } from 'react';

interface SidebarHeaderProps {
  title?: string;
}

const SidebarHeader: FC<SidebarHeaderProps> = ({ title = 'MiniatureDB' }) => {
  return (
    <div className="p-4 border-b">
      <h1 className="text-xl font-bold">{title}</h1>
    </div>
  );
};

export default SidebarHeader; 