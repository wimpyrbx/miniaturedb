import { RouteObject } from 'react-router-dom';
import { Home } from '../pages/Home';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';

export const homeRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AuthenticatedLayout><Home /></AuthenticatedLayout>
  }
]; 