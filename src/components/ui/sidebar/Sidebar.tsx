import { Home, Database, Settings } from 'lucide-react';
import SidebarHeader from './SidebarHeader';
import SidebarItem from './SidebarItem';
import { ThemeSelect } from '../../themes/ThemeSelect';

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen border-r flex flex-col">
      <SidebarHeader />
      <nav className="flex-1">
        <SidebarItem icon={Home} label="Home" />
        <SidebarItem icon={Database} label="Database" />
        <SidebarItem icon={Settings} label="Settings" />
      </nav>
      <div className="p-4 border-t">
        <ThemeSelect />
      </div>
    </aside>
  );
};

export default Sidebar; 