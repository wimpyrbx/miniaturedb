import { RouteObject } from 'react-router-dom';
import { authRoutes } from './auth';
import { homeRoutes } from './home';
import { dashboardRoutes } from './dashboard';
import { miniaturesRoutes } from './miniatures';
import { adminRoutes } from './admin';

export const routes: RouteObject[] = [
  ...authRoutes,
  ...homeRoutes,
  ...dashboardRoutes,
  ...miniaturesRoutes,
  ...adminRoutes
]; 