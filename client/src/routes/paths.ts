// ----------------------------------------------------------------------

function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_DASHBOARD = '/dashboard';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  login: '/login',
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  dashboard: path(ROOTS_DASHBOARD, '/dashboard'),
  items: path(ROOTS_DASHBOARD, '/items'),
  transactions: {
    root: path(ROOTS_DASHBOARD, '/transactions'),
    list: path(ROOTS_DASHBOARD, '/transactions/list'),
    transfers: path(ROOTS_DASHBOARD, '/transactions/transfers'),
    classify: path(ROOTS_DASHBOARD, '/transactions/classify'),
    charts: path(ROOTS_DASHBOARD, '/transactions/charts'),
    view: (id: string) => path(ROOTS_DASHBOARD, `/transactions/${id}`),
    edit: (id: string) => path(ROOTS_DASHBOARD, `/transactions/${id}/edit`),
  },
  user: {
    root: path(ROOTS_DASHBOARD, '/user'),
    four: path(ROOTS_DASHBOARD, '/user/four'),
    five: path(ROOTS_DASHBOARD, '/user/five'),
    six: path(ROOTS_DASHBOARD, '/user/six'),
  },
};
