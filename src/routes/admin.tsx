import { RouteObject } from 'react-router-dom';
import { ProductAdmin } from '../pages/ProductAdmin';
import { ClassificationAdmin } from '../pages/ClassificationAdmin';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';

export const adminRoutes: RouteObject[] = [
  {
    path: '/product-admin',
    element: <AuthenticatedLayout><ProductAdmin /></AuthenticatedLayout>
  },
  {
    path: '/classification-admin',
    element: <AuthenticatedLayout><ClassificationAdmin /></AuthenticatedLayout>
  }
]; 