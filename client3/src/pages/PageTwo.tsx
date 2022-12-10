import { Helmet } from 'react-helmet-async';
import { SetStateAction, useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Card,
  Table,
  Stack,
  Button,
  Tooltip,
  Divider,
  TableBody,
  Container,
  IconButton,
  TableContainer,
  TextField,
  MenuItem,
  TextFieldProps,
  InputAdornment,
  TableRow,
  TableCell,
  Typography,
  Link,
  Checkbox,
} from '@mui/material';
// routes
//import { PATH_DASHBOARD } from '../routes/paths';
// utils
import { fDate } from '../utils/formatTime';

// components
//import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
//import CustomBreadcrumbs from '../components/custom-breadcrumbs';
import { useSettingsContext } from '../components/settings';
import {
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
  useTable,
} from '../components/table';
// sections
import { _invoices } from 'src/_mock/arrays/_invoice';
import DatePicker from '@mui/lab/DatePicker/DatePicker';
import MenuPopover from 'src/components/menu-popover';
import { CustomAvatar } from 'src/components/custom-avatar';
import { fCurrency } from 'src/utils/formatNumber';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------

const SERVICE_OPTIONS = [
  'all',
  'full stack development',
  'backend development',
  'ui design',
  'ui/ux design',
  'front end development',
];

const ITEMS = [
  {
    id: 'zPP5mRmNQXSMkpY7ALQziMNDkQBD4PcOvNBr1',
    accounts: [
      {
        id: '0jjVgQgKBrhLBZdbAYQksOyjYQ6M09cvBEyNB',
        name: 'BROKERAGELINK ROTH',
        mask: '0308',
        type: 'investment',
        subtype: 'roth',
        officialName: 'BROKERAGELINK ROTH',
        currency: 'USD',
        totalTransactions: 208,
        latestBalance: {
          balanceCents: 79464,
          limitCents: 0,
          lastUpdateDate: '12/9/2022',
          availableCents: 79464,
        },
        institution: {
          id: 'ins_12',
          url: null,
          name: 'Fidelity',
          logo: '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',
          products: 'assets,auth,balance,transactions,identity,investments',
          countryCodes: 'US',
          primaryColor: '#408800',
        },
      },
      {
        id: '4xxRwNw5kJsqmNa79L56uXndYr4zy9fnz6ebP',
        name: 'INDIVIDUAL',
        mask: '3400',
        type: 'investment',
        subtype: 'brokerage',
        officialName: 'INDIVIDUAL',
        currency: 'USD',
        totalTransactions: 57,
        latestBalance: {
          balanceCents: 5004,
          limitCents: 0,
          lastUpdateDate: '12/9/2022',
          availableCents: 5004,
        },
        institution: {
          id: 'ins_12',
          url: null,
          name: 'Fidelity',
          logo: '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',
          products: 'assets,auth,balance,transactions,identity,investments',
          countryCodes: 'US',
          primaryColor: '#408800',
        },
      },
      {
        id: '8LLXQJQ6jdcXK6BN9DdZtbP94ENBr3Hvkrpa6',
        name: 'HP INC. 401(K) PLAN',
        mask: '9740',
        type: 'investment',
        subtype: '401k',
        officialName: 'HP INC. 401(K) PLAN',
        currency: 'USD',
        totalTransactions: 0,
        latestBalance: {
          balanceCents: 0,
          limitCents: 0,
          lastUpdateDate: '12/9/2022',
          availableCents: 0,
        },
        institution: {
          id: 'ins_12',
          url: null,
          name: 'Fidelity',
          logo: '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',
          products: 'assets,auth,balance,transactions,identity,investments',
          countryCodes: 'US',
          primaryColor: '#408800',
        },
      },
      {
        id: 'JMMjLyL5DrCqBdOoN51Yu5mwO17gKDf73V6w1',
        name: 'MICROSOFT ESPP PLAN',
        mask: '3400',
        type: 'investment',
        subtype: 'stock plan',
        officialName: 'MICROSOFT ESPP PLAN',
        currency: 'USD',
        totalTransactions: 0,
        latestBalance: {
          balanceCents: 0,
          limitCents: 0,
          lastUpdateDate: '12/9/2022',
          availableCents: 0,
        },
        institution: {
          id: 'ins_12',
          url: null,
          name: 'Fidelity',
          logo: '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',
          products: 'assets,auth,balance,transactions,identity,investments',
          countryCodes: 'US',
          primaryColor: '#408800',
        },
      },
      {
        id: 'ZggMLyLdxJcwYKb3E6A4u6XZejKOdpfkP7X6A',
        name: 'META PLATFORMS',
        mask: '1355',
        type: 'investment',
        subtype: '401k',
        officialName: 'META PLATFORMS',
        currency: 'USD',
        totalTransactions: 326,
        latestBalance: {
          balanceCents: 178407,
          limitCents: 0,
          lastUpdateDate: '12/9/2022',
          availableCents: 178407,
        },
        institution: {
          id: 'ins_12',
          url: null,
          name: 'Fidelity',
          logo: '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',
          products: 'assets,auth,balance,transactions,identity,investments',
          countryCodes: 'US',
          primaryColor: '#408800',
        },
      },
      {
        id: 'a66NADAqgnsBa4PdoY1OSYXe0J7OQ1u13pRXx',
        name: 'HP ENTERPRISE ESPP',
        mask: '3400',
        type: 'investment',
        subtype: 'stock plan',
        officialName: 'HP ENTERPRISE ESPP',
        currency: 'USD',
        totalTransactions: 0,
        latestBalance: {
          balanceCents: 0,
          limitCents: 0,
          lastUpdateDate: '12/9/2022',
          availableCents: 0,
        },
        institution: {
          id: 'ins_12',
          url: null,
          name: 'Fidelity',
          logo: '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',
          products: 'assets,auth,balance,transactions,identity,investments',
          countryCodes: 'US',
          primaryColor: '#408800',
        },
      },
      {
        id: 'jKKBMAMqQXUrRYj5vgyBiv6dE5DpxMUjkMAN8',
        name: 'BROKERAGELINK',
        mask: '0307',
        type: 'investment',
        subtype: 'retirement',
        officialName: 'BROKERAGELINK',
        currency: 'USD',
        totalTransactions: 0,
        latestBalance: {
          balanceCents: 0,
          limitCents: 0,
          lastUpdateDate: '12/9/2022',
          availableCents: 0,
        },
        institution: {
          id: 'ins_12',
          url: null,
          name: 'Fidelity',
          logo: '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',
          products: 'assets,auth,balance,transactions,identity,investments',
          countryCodes: 'US',
          primaryColor: '#408800',
        },
      },
      {
        id: 'raajEXE0YPIMdxmo1KbPi8wR91ByNEtwj5Ym3',
        name: 'Arthur',
        mask: '5594',
        type: 'investment',
        subtype: '529',
        officialName: 'Arthur',
        currency: 'USD',
        totalTransactions: 12,
        latestBalance: {
          balanceCents: 19446,
          limitCents: 0,
          lastUpdateDate: '12/9/2022',
          availableCents: 19446,
        },
        institution: {
          id: 'ins_12',
          url: null,
          name: 'Fidelity',
          logo: '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',
          products: 'assets,auth,balance,transactions,identity,investments',
          countryCodes: 'US',
          primaryColor: '#408800',
        },
      },
      {
        id: 'v66xPOPYXysML5A4e0b6ivOgadmQpAU0PJX3N',
        name: 'JOINT WROS',
        mask: '7743',
        type: 'depository',
        subtype: 'checking',
        officialName: 'JOINT WROS',
        currency: 'USD',
        totalTransactions: 323,
        latestBalance: {
          balanceCents: 52103,
          limitCents: 0,
          lastUpdateDate: '12/9/2022',
          availableCents: 52103,
        },
        institution: {
          id: 'ins_12',
          url: null,
          name: 'Fidelity',
          logo: 'iVBORw0KGgoAAAANSUhEUgAAAJgAAACYCAMAAAAvHNATAAAAZlBMVEVHcEyEp0OivXHu8uDN3LJ3ni98ojj09+7g686TsluzyYpxmiX////////8/fr///9vmCT///9plBtslh5tlyF6oDSGqUfW4sH6+/fr8eDh6tHN27KQsFaat2W4zZOlv3avxoTD1KOHzi5fAAAAEHRSTlMAuX4MO+TP/h6fY/Gm0V2HZ+UkegAADNZJREFUeNrFXOmaqygQ7aSTaHpVFneNvv9LDiAiS4EY03f8MfPddHc41nJqoeDt7eDzfvk43++n2+16pZ/X6+12ut/PH5f3t//xST/upytB7MGY8CfL2H8w5p+Q6+n+kf4/oK4MAWZg4Ifwn17/MbgLB+XHZKBj4C7/SFbnK9NUFv8gdD2nf6/Bm4mKxEBkdnj7+Et3SO+flqwIpXHCI+jznv4ZLILs9XD3QD4o1P5d8ifQLneMgdWLCXuA0dGRJcIvd4QUhMWXbyiMC3cDIEsG7aVSO38in77qDkaMhhH8G/x5fp0Wb8hv1TW8fkaa3vMDdLu8SItB1qpLcH1SJAX2eugr9Hm5oiANlAlIGOhRBYgEXQ8L7bxB8rjNQSPDZR2mtWOWlp7QBnHiKYeMjNCqCb8ROh1Q5+VzEYZ3ETTkLUQLPfix6Z5Pq/O8JhBeQ8ZjXgPGxAQ5oM3U40l13tdvJqMPGXrkgJExesv9sWr94/szKbNhXrT1aBP3OWBkuMvz3vMquCjUV+HT+zFcGR4mWADMmPISA5ZXeWSM6aT/ay+y9IZt3cCqQUw2gJE1eeKjsdLQPL6lR3AxACMsAlxUrpHxD2sf71neugvZ+w3AUNegDGjlGhkamX4JzC4Vtd/i9h5vXxh0vxZKyGjiGhkpc5jG2Je4LBJvZx66b0COz+rctifE1QtmY10FiJ3g027+svyv6hCE1zYyzm0QjeHCw25xfHb2MnbD/M/RJubATFGywM5ozFUZbfLSQ9MRMeCCvWGRUxaQRuSWkQmzyx0fJlkJi1x8y2bcTD9JIPcCTAdx8RhGxl8AoDEWPkH3mb/6c4s0TjiQDzAyrWwVIbaeaWTiE4fGOIX4k9psywHOaCMrzGvry1n0yQ1B8gDu0hjqPZ4aZ2aXcKqCO/btjRnOuSQMI+NydWgMdQkYuvRfCZhZeiUbdT43KDOcC27QTcoRoZLiI1w9XNO9DGZFRnMBYeqGkXH+MH+HUP5Zs9UVum8oMtTAEYZt2PCsuVVCRGA3aIxkrcC+9dpeZd7I/M0UBUTGOarRjAUXApgy9tnmDBqbldvizY7QLeyRdHpkKFB8mIvM2tWMrLRsTkKtik1gHs9MP5VFTE3n6aFIWtdikPxgyaSlJmuLKMJUgTPZmQFpdrV8gseqLRAOiGyNLbPDqYVnJ83XonJWfogqMOoGWQbg+0aMRH1STRQswiUQLZzPwBotgGs0hiXuEXlhFW2p1AzEzLuZuRQsax9AaNK6y7Wtk882RDTFroorddgQrKmaMuynjNROeCkPP5AXWLqb04uFuSSrKRojswBzuCUlYFUP/fVxGhSYIB9uTE3vQpNmtIRzJNcW2ptDugIyGyRU4Ik4wmDlTYFCLJsS4O8e3J1Kx0HJzO0Lzy5Yas3gJI3JVwCpgiA6MLVrapSfp9vBCHViGeagBBIZMzOiSYVHJRkGJI1JorCjqwYreTj7K6Zjvn/C1ECF/bgO2mgLSmcQjreArGcHSnSYLixbjZLL9Jrpw8t+s564g7qBe7bxRX4iKknEnMYWonCoYoGVTxQsoT+cKAm3mWZ1mA5KpCdyM1MoE4qKSjkCkURhJ3AKFqBGJ2KmocyylwppeqJekHTLopQsdsVdcdEqoxI8rR8bsEZJyIWXctO4hJpzrdTV6qALeeUTlumFMLlSqVi5hJ5kr7A8arRDeThxlS5gOCjqKmVAi/6YEColpMXwWFTFLiyfGmUqG5npM6ZRr68cVMZEvrCMQvyHy68VCreiCg1WQI1mwriZUWcz184vOwoHxZqcagV7+Z1OfSSpgsF6qM8CajSp7Lq95YjWpaSDIiWecv3Rgmb9RFAFQdkKq3psbVovuky3U0vdBaSDriILPSIN02HlzWbqr/zyA2UxyLJWW5A56CqyRRS1C4wxMIOlvVNLI8SAPuDEwteWH3UUbaGMflmzcXCVxIS1rUbdyK6xIwGKa2WYMkVW945uWfKow4pS42pkKc5iH1wY2jKBPEZHYG1vCLGlKHahNNrEHK51tJa5mjR0XY04elpDGJlkMUqXKZ0w104wrqqgYS+NVeNqZLIj1g9tO419V1AxlsPHdsAiCT9AAAMag7ji1ShW4d2y6yKL4tHWgh0bhvDRF5RmGBAi7mqIr1AZgLWpRj5ENS82/5tZ//tamiKUdUNTrbzUlO2gCRHPQjS4VkVtmzwM2I4aiUIyT1RRWnRd/xjZcvPP360IjhGRgtPf1xaiwbVzL2NNJ2A1akC4VChH0nMkU1s2TZ1wcdTl2FEVxx2nZH9OdcGZQVAK0USWUIxaH6zkMSMpCiESgaRmSCozarSPIlvn0ZhbQkkiUxyzuDKgHBP2iIhfk81UMiRJ4nXaqplmUGay6Mt5MMK0n+qIQM3rf5X473ySZuptULLuDURKRmxZMYYEp3JUND0Bqhx6msFDcuQebOzP3kD7Nig40cSonwBF/JN7+BSo3Fa5+r1BplxrpRSTo3Hn25pxvMUAW7wBFhyvztaaaAtUGwFqLi5jkx4ivMEV3NyObbYx2YwQfq5LRIoD53qDaPlsptkQI2xlZHTP5Kjk39EqNsIBvB76XaDmvuHbZ3ZEZI3RyvB4YNvTfZOzvG0Zn1hDlDuX2dsFk8C2R2RMlXHApFvaXDuX2aEAvip06rJdNhZBF8RHZLJ5j8tIrhiisZFtHuPU72Ew2WAiNIkm12YoorAxYKGQxG298wdLuaOEdwXwqhkLvOkKLLf2BvHN9GLZHfSnYj5s5YNuYGPVCJj2bCRkVV2vrVVC6ycyi/YRpBAG7IyibV3WKX1Hi5J3pmM0WdXJMxTCEkUrtYZsvUqachp4yp/NdZOoRngPT9+A8AAbaPcY2gZMYP0UwlJrrRiRtl7pNYiskvBSzui9MlnDbmhy4oV0Rot+nEpXfB4KYcXIUr4RlRHyso0JSFRtQOWrdRfzIYtIxUreeZrrv2wWX22Ij7kpsc2NlW+S+pkCp1Ja0CwguFlAyJx6la14HjGpmNZyFfgc8VWlRSGi3SOJjHawgOwNrmWjVPwqCqZila/gVeLrlfhMChEDNQtfxCRwS7dHH3Ao/I/qQiW9h5QYZbDKlymLwRPYyLo5uKMNhZb+mL47JE9xAQ8T6FBtNi/E0S/M1Tu07TBHX9GGim/crbs3O15FbaFkZCt/4dZHte7wNfYAz1jZmx0Rf5WNyY62MNH76XHNYbJuj+j7orxXEn5Q0S4bYtGdznt8Ox3R1srCJNmWEY+UdF1EIpPt9BgjQ7TJoW2+fa2BpI9DtmwMbhuZvmNjDg/tyyyqRxSya+wml97gT6g7o7XjGSJO8akRh41tQWNLJDGn2obdmVibbVrOOkcW1KXeQa8ma4Ki2Z8jllu0sW6kBree8brnwGCZGQqJ2oGzNw+3nFPbeg5s1mstandya6O3b6UYw7rPGt7gTSPGG3CXuDv1mTUIFWn2imk3nPMWMRCikkIIVoZ3aJJnJAh3i1kM/lwGfUBjgGBSCM5E7dTkPBK17vVOXuc0RmhAKsMyKWx8s5SxrQGj90hlUPc5pzWnBYxpSXes/SOetNoHTARZguhUBWYcrDEtN8WYk8J69KcEUU0et7/NB9paeIcJGp+0I7mIQnzGIlAt720NqIycYJF0V0BMd0YBTZHxgVPf8OTa9Ev2xyOsZhKEFzgJNzBvqo+bEhaFfOOm63c8s0uzymiZBDTXgI5orI7JzX4qttpYu5s81izZ7AVmwg0OqCsuw0XTbsJ6rsljTTaz/NdMuOGTIzKUk2LyTlpD44DP2b/8EuYFmnP6jmfIiEmzqGGf6Slg9vQ8ysamJ+4QIHjQIK5iqJ8D5gwRMy+Q5aD/1Mg9vijfn1Tn4Cyl4KaA5ccdZjmWVOfw9OmauKZPH/95hSa9x6bCp8zO6K816Ts9snUu74T/WpOeGHk6cCjvYHkUsP+IQ3mBY4xPJ9UR9o8vRw5+Pp1Uu/Zvpa9xdzlEsBkpjwGzzuzFHv0/oT/WpHXeDEUeLoaPYx9LqkP2v+PYP3iA/UB5FLT/HQfYoSP/ZnmUHAe2nNcgRy8jeK0mVSd35yUJzrUSx5Nq2P7R4QsvDpZHvrGz0zOXf/n47NkhNsD+n7m6xLzs5RVJtWv/T9/ds16PY/Q06hfh+nnthUKHUjHt+T52P5R7BdOLNPn7+kurXqHJ6uft8GNd8/USTX695to242K0Q0m1tK7XXXSnXyXXHNXi79sLH3X53mFNfr36ykJ5XeFBn/z6i3s7+QWP5BC7fv3d3ZPZgTj5+5c3ib7/fD/piT9/f8Hp725s37//6Lray9cObN9f/+iiWqZPLrefr4h0Mfn6+V/uHf759Yvu++v3fwGlhPd+YfC+vr6/v1kRXLH/sX/8/lze3w7emPsf9rTHQ7gM2pIAAAAASUVORK5CYII=',
          products: 'assets,auth,balance,transactions,identity,investments',
          countryCodes: 'US',
          primaryColor: '#408800',
        },
      },
      {
        id: 'xDD8gmgNQksMbNYjQkenimBj6YM4PEfKp3Yz1',
        name: 'HP ESPP',
        mask: '3400',
        type: 'investment',
        subtype: 'stock plan',
        officialName: 'HP ESPP',
        currency: 'USD',
        totalTransactions: 0,
        latestBalance: {
          balanceCents: 0,
          limitCents: 0,
          lastUpdateDate: '12/9/2022',
          availableCents: 0,
        },
        institution: {
          id: 'ins_12',
          url: null,
          name: 'Fidelity',
          logo: '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',
          products: 'assets,auth,balance,transactions,identity,investments',
          countryCodes: 'US',
          primaryColor: '#408800',
        },
      },
    ],
  },
  {
    id: 'Y8zpXKagP4tg7NygK6g5sBkxKexngZHQ8v9ax',
    accounts: [
      {
        id: 'm134kOQvLRsrqDVr6Zrytk9rLPZkJnCQxqPvm',
        name: 'Costco Anywhere Visa® Card by Citi',
        mask: '7106',
        type: 'credit',
        subtype: 'credit card',
        officialName: 'Costco Anywhere Visa® Card by Citi',
        currency: 'USD',
        totalTransactions: 473,
        latestBalance: {
          balanceCents: -1685,
          limitCents: 11500,
          lastUpdateDate: '12/9/2022',
          availableCents: 7769,
        },
        institution: {
          id: 'ins_5',
          url: null,
          name: 'Citibank Online',
          logo: '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',
          products:
            'assets,auth,balance,transactions,credit_details,income,identity,investments,liabilities',
          countryCodes: 'US',
          primaryColor: '#204081',
        },
      },
    ],
  },
] as Array<IItem>;

const TABLE_HEAD = [
  { id: 'accountName', label: 'Account', align: 'left' },
  { id: 'lastUpdated', label: 'Latest Transaction', align: 'left' },
  { id: 'balance', label: 'Balance', align: 'center', width: 140 },
  // { id: 'status', label: 'Status', align: 'left' },
  { id: '' },
];

type IItem = {
  id: string;
  accounts: Array<IAccount>;
};

type IAccount = {
  id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  officialName: string;
  currency: string;
  totalTransactions: number;
  latestBalance: IBalance;
  institution: IInstitution;
};

type IBalance = {
  balanceCents: number;
  limitCents: number;
  lastUpdateDate: string;
  availableCents: number;
};

type IInstitution = {
  id: string;
  url: string | null;
  name: string;
  logo: string | null;
  products: string;
  countryCodes: string;
  primaryColor: string;
};

// ----------------------------------------------------------------------

export default function PageTwo() {
  const theme = useTheme();

  const { themeStretch } = useSettingsContext();

  const navigate = useNavigate();

  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({ defaultOrderBy: 'createDate' });

  const [tableData, setTableData] = useState(ITEMS.map((item) => item.accounts).flat(1));

  const [filterName, setFilterName] = useState('');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');

  const [filterService, setFilterService] = useState('all');

  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterService,
    filterStatus,
    filterStartDate,
    filterEndDate,
  });

  const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const denseHeight = dense ? 56 : 76;

  const isFiltered =
    filterStatus !== 'all' ||
    filterName !== '' ||
    filterService !== 'all' ||
    (!!filterStartDate && !!filterEndDate);

  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterStatus) ||
    (!dataFiltered.length && !!filterService) ||
    (!dataFiltered.length && !!filterEndDate) ||
    (!dataFiltered.length && !!filterStartDate);
  /*

  const getLengthByStatus = (status: string) =>
    tableData.filter((item: { status: string }) => item.status === status).length;

  const getTotalPriceByStatus = (status: string) =>
    sumBy(
      tableData.filter((item: { status: string }) => item.status === status),
      'totalPrice'
    );

  const getPercentByStatus = (status: string) =>
    (getLengthByStatus(status) / tableData.length) * 100; 

  const TABS = [
    { value: 'all', label: 'All', color: 'info', count: tableData.length },
    { value: 'paid', label: 'Paid', color: 'success', count: getLengthByStatus('paid') },
    { value: 'unpaid', label: 'Unpaid', color: 'warning', count: getLengthByStatus('unpaid') },
    { value: 'overdue', label: 'Overdue', color: 'error', count: getLengthByStatus('overdue') },
    { value: 'draft', label: 'Draft', color: 'default', count: getLengthByStatus('draft') },
  ] as const; */

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleFilterStatus = (event: React.SyntheticEvent<Element, Event>, newValue: string) => {
    setPage(0);
    setFilterStatus(newValue);
  };

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterService = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterService(event.target.value);
  };

  const handleDeleteRow = (id: string) => {
    const deleteRow = tableData.filter((row: { id: string }) => row.id !== id);
    setSelected([]);
    setTableData(deleteRow);

    if (page > 0) {
      if (dataInPage.length < 2) {
        setPage(page - 1);
      }
    }
  };

  const handleDeleteRows = (selected: string[]) => {
    const deleteRows = tableData.filter((row: { id: string }) => !selected.includes(row.id));
    setSelected([]);
    setTableData(deleteRows);

    if (page > 0) {
      if (selected.length === dataInPage.length) {
        setPage(page - 1);
      } else if (selected.length === dataFiltered.length) {
        setPage(0);
      } else if (selected.length > dataInPage.length) {
        const newPage = Math.ceil((tableData.length - selected.length) / rowsPerPage) - 1;
        setPage(newPage);
      }
    }
  };

  const handleEditRow = (id: string) => {
    //navigate(PATH_DASHBOARD.invoice.edit(id));
  };

  const handleViewRow = (id: string) => {
    //navigate(PATH_DASHBOARD.invoice.view(id));
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStatus('all');
    setFilterService('all');
    setFilterEndDate(null);
    setFilterStartDate(null);
  };

  return (
    <>
      <Helmet>
        <title>Items</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Card>
          <InvoiceTableToolbar
            isFiltered={isFiltered}
            filterName={filterName}
            filterService={filterService}
            filterEndDate={filterEndDate}
            onFilterName={handleFilterName}
            optionsService={SERVICE_OPTIONS}
            onResetFilter={handleResetFilter}
            filterStartDate={filterStartDate}
            onFilterService={handleFilterService}
            onFilterStartDate={(newValue: SetStateAction<Date | null>) => {
              setFilterStartDate(newValue);
            }}
            onFilterEndDate={(newValue: SetStateAction<Date | null>) => {
              setFilterEndDate(newValue);
            }}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={dense}
              numSelected={selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked: any) =>
                onSelectAllRows(
                  checked,
                  tableData.map((row: { id: any }) => row.id)
                )
              }
              action={
                <Stack direction="row">
                  <Tooltip title="Sent">
                    <IconButton color="primary">
                      <Iconify icon="ic:round-send" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Download">
                    <IconButton color="primary">
                      <Iconify icon="eva:download-outline" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Print">
                    <IconButton color="primary">
                      <Iconify icon="eva:printer-fill" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={handleOpenConfirm}>
                      <Iconify icon="eva:trash-2-outline" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />

            <Scrollbar>
              <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={selected.length}
                  onSort={onSort}
                  onSelectAllRows={(checked: any) =>
                    onSelectAllRows(
                      checked,
                      tableData.map((row: { id: any }) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <InvoiceTableRow
                        key={row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                        onSelectRow={() => onSelectRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
                  />

                  <TableNoData isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            //
            dense={dense}
            onChangeDense={onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows(selected);
              handleCloseConfirm();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filterName,
  filterStatus,
  filterService,
  filterStartDate,
  filterEndDate,
}: {
  inputData: IAccount[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  filterStatus: string;
  filterService: string;
  filterStartDate: Date | null;
  filterEndDate: Date | null;
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (account) =>
        account.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
        account.mask.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  /*
  if (filterStatus !== 'all') {
    inputData = inputData.filter((invoice) => invoice.status === filterStatus);
  } */

  if (filterService !== 'all') {
    inputData = inputData.filter((account) => account.type === filterService);
  }

  /*
  if (filterStartDate && filterEndDate) {
    inputData = inputData.filter(
      (invoice) =>
        fTimestamp(invoice.createDate) >= fTimestamp(filterStartDate) &&
        fTimestamp(invoice.createDate) <= fTimestamp(filterEndDate)
    );
  }*/

  return inputData;
}

const INPUT_WIDTH = 160;

function InvoiceTableToolbar({
  filterName,
  isFiltered,
  onFilterName,
  filterEndDate,
  filterService,
  onResetFilter,
  optionsService,
  filterStartDate,
  onFilterService,
  onFilterEndDate,
  onFilterStartDate,
}: {
  filterName: string;
  isFiltered: boolean;
  filterService: string;
  optionsService: string[];
  filterEndDate: Date | null;
  onResetFilter: VoidFunction;
  filterStartDate: Date | null;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterService: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterStartDate: (value: Date | null) => void;
  onFilterEndDate: (value: Date | null) => void;
}) {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{ px: 2.5, py: 3 }}
    >
      <TextField
        fullWidth
        select
        label="Service type"
        value={filterService}
        onChange={onFilterService}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: { maxHeight: 220 },
            },
          },
        }}
        sx={{
          maxWidth: { md: INPUT_WIDTH },
          textTransform: 'capitalize',
        }}
      >
        {optionsService.map((option) => (
          <MenuItem
            key={option}
            value={option}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 0.75,
              typography: 'body2',
              textTransform: 'capitalize',
              '&:first-of-type': { mt: 0 },
              '&:last-of-type': { mb: 0 },
            }}
          >
            {option}
          </MenuItem>
        ))}
      </TextField>

      <DatePicker
        label="Start date"
        value={filterStartDate}
        onChange={onFilterStartDate}
        renderInput={(params: JSX.IntrinsicAttributes & TextFieldProps) => (
          <TextField
            {...params}
            fullWidth
            sx={{
              maxWidth: { md: INPUT_WIDTH },
            }}
          />
        )}
      />

      <DatePicker
        label="End date"
        value={filterEndDate}
        onChange={onFilterEndDate}
        renderInput={(params: JSX.IntrinsicAttributes & TextFieldProps) => (
          <TextField
            {...params}
            fullWidth
            sx={{
              maxWidth: { md: INPUT_WIDTH },
            }}
          />
        )}
      />

      <TextField
        fullWidth
        value={filterName}
        onChange={onFilterName}
        placeholder="Search client or invoice number..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      {isFiltered && (
        <Button
          color="error"
          sx={{ flexShrink: 0 }}
          onClick={onResetFilter}
          startIcon={<Iconify icon="eva:trash-2-outline" />}
        >
          Clear
        </Button>
      )}
    </Stack>
  );
}

function InvoiceTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
}: {
  row: IAccount;
  selected: boolean;
  onSelectRow: VoidFunction;
  onViewRow: VoidFunction;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
}) {
  const [openConfirm, setOpenConfirm] = useState(false);

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CustomAvatar
              src={`data:image/png;base64,${row.institution.logo}`}
              name={row.institution.name}
            />

            <div>
              <Typography variant="subtitle2" noWrap>
                {row.name}
              </Typography>

              <Link
                noWrap
                variant="body2"
                onClick={onViewRow}
                sx={{ color: 'text.disabled', cursor: 'pointer' }}
              >
                {`...${row.mask}`}
              </Link>
            </div>
          </Stack>
        </TableCell>

        <TableCell align="left">{fDate(row.latestBalance.lastUpdateDate)}</TableCell>

        <TableCell align="center">{fCurrency(row.latestBalance.balanceCents)}</TableCell>

        {/*
        <TableCell align="left">
          <Label
            variant="soft"
            color={
              (row. === 'paid' && 'success') ||
              (status === 'unpaid' && 'warning') ||
              (status === 'overdue' && 'error') ||
              'default'
            }
          >
            {status}
          </Label>
        </TableCell> */}

        <TableCell align="right">
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:refresh-outline" />
          </IconButton>
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            onViewRow();
            handleClosePopover();
          }}
        >
          <Iconify icon="eva:eye-fill" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            handleClosePopover();
          }}
        >
          <Iconify icon="eva:edit-fill" />
          Edit
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            handleOpenConfirm();
            handleClosePopover();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" />
          Delete
        </MenuItem>
      </MenuPopover>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
