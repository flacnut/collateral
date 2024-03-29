// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  user: icon('ic_user'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  banking: icon('ic_banking'),
  transfers: icon('ic_transfer'),
};

const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'accounts',
    items: [
      { title: 'Dashboard', path: PATH_DASHBOARD.dashboard, icon: ICONS.dashboard },
      { title: 'Plaid Links', path: PATH_DASHBOARD.items, icon: ICONS.ecommerce },
      {
        title: 'Accounts',
        path: PATH_DASHBOARD.accounts.root,
        icon: ICONS.banking,
        children: [{ title: 'list', path: PATH_DASHBOARD.items }],
      },
      {
        title: 'transactions',
        path: PATH_DASHBOARD.transactions.root,
        icon: ICONS.analytics,
        children: [
          { title: 'list', path: PATH_DASHBOARD.transactions.list },
          { title: 'classify', path: PATH_DASHBOARD.transactions.classify },
          { title: 'duplicates', path: PATH_DASHBOARD.transactions.duplicates },
          {
            title: 'transfers',
            path: PATH_DASHBOARD.transactions.transfers,
          },
          { title: 'charts', path: PATH_DASHBOARD.transactions.charts },
          { title: 'chart builder', path: PATH_DASHBOARD.transactions.chartbuilder },
        ],
      },
    ],
  },

  // ASSETS
  // ----------------------------------------------------------------------
  {
    subheader: 'assets',
    items: [],
  },
];

export default navConfig;
