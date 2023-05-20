import { Navigate, useRoutes } from 'react-router-dom';
// auth
import AuthGuard from '../auth/AuthGuard';
import GuestGuard from '../auth/GuestGuard';
// layouts
import CompactLayout from '../layouts/compact';
import DashboardLayout from '../layouts/dashboard';
// config
import { PATH_AFTER_LOGIN } from '../config';
//
import {
  Page404,
  Transactions,
  ItemsPage,
  PageSix,
  PageFour,
  PageFive,
  LoginPage,
  Dashboard,
  ChartBuilder,
  Transfers,
  TransactionView,
  TransactionClassifier,
  TransactionCharts,
  TransactionDuplicates,
} from './elements';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/',
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        {
          path: 'login',
          element: (
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          ),
        },
      ],
    },
    {
      path: '/dashboard',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'items', element: <ItemsPage /> },
        {
          path: 'transactions',
          children: [
            { element: <Navigate to="/dashboard/transactions/list" replace />, index: true },
            { path: 'list', element: <Transactions /> },
            { path: 'transfers', element: <Transfers /> },
            { path: 'classify', element: <TransactionClassifier /> },
            { path: 'duplicates', element: <TransactionDuplicates /> },
            { path: 'charts', element: <TransactionCharts /> },
            { path: 'chartbuilder', element: <ChartBuilder /> },
            { path: ':id', element: <TransactionView /> },
          ],
        },
        {
          path: 'user',
          children: [
            { element: <Navigate to="/dashboard/user/four" replace />, index: true },
            { path: 'four', element: <PageFour /> },
            { path: 'five', element: <PageFive /> },
            { path: 'six', element: <PageSix /> },
          ],
        },
      ],
    },
    {
      element: <CompactLayout />,
      children: [{ path: '404', element: <Page404 /> }],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
