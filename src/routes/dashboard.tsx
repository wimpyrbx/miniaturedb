import { RouteObject } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';

export const dashboardRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: <AuthenticatedLayout><Dashboard /></AuthenticatedLayout>
  }
]; 