import React, {Suspense} from 'react';

// Icons
import SearchIcon from '@material-ui/icons/SearchOutlined';

// Pages
import PageIpLookup from '../components/pages/ipSearch';

const routes = [
  {
    path: '/query/ip',
    exact: true,
    sidebarName: 'query.ip.activity',
    navbarName: 'query.ip.activity',
    icon: SearchIcon,
    component: () => <PageIpLookup />
  },
];

export default routes;