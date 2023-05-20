import { Suspense, lazy, ElementType } from 'react';
// components
import LoadingScreen from '../components/loading-screen';

// ----------------------------------------------------------------------

const Loadable = (Component: ElementType) => (props: any) =>
  (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );

// ----------------------------------------------------------------------

export const LoginPage = Loadable(lazy(() => import('../pages/LoginPage')));
export const ItemsPage = Loadable(lazy(() => import('../pages/Items')));

export const ChartBuilder = Loadable(lazy(() => import('../pages/ChartBuilder')));

export const Dashboard = Loadable(lazy(() => import('../pages/Dashboard')));
export const Transactions = Loadable(lazy(() => import('../pages/Transactions')));
export const Transfers = Loadable(lazy(() => import('../pages/Transfers')));
export const TransactionView = Loadable(lazy(() => import('../pages/TransactionView')));
export const TransactionClassifier = Loadable(lazy(() => import('../pages/TransactionClassifier')));
export const TransactionCharts = Loadable(lazy(() => import('../pages/TransactionCharts')));
export const TransactionDuplicates = Loadable(lazy(() => import('../pages/TransactionDuplicates')));

export const PageFour = Loadable(lazy(() => import('../pages/PageFour')));
export const PageFive = Loadable(lazy(() => import('../pages/PageFive')));
export const PageSix = Loadable(lazy(() => import('../pages/PageSix')));

export const Page404 = Loadable(lazy(() => import('../pages/Page404')));
