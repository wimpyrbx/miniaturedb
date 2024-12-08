import { RouteObject } from 'react-router-dom';
import Miniatures from '../pages/Miniatures';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';

export const miniaturesRoutes: RouteObject[] = [
  {
    path: '/miniatures',
    element: <AuthenticatedLayout><Miniatures /></AuthenticatedLayout>
  }
]; 