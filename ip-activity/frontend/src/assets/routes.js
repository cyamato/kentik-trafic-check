import React, {Suspense} from 'react';

// Icons
import SearchIcon from '@material-ui/icons/SearchOutlined';
import DeviceIcon from '@material-ui/icons/StorageOutlined';
import DeviceLookupIcon from '@material-ui/icons/LocationSearchingOutlined';

// Pages
import PageIpLookup from '../components/pages/ipSearch';
import DeviceList from '../components/pages/deviceList';
import FindDevice from '../components/pages/deviceLookup';

const routes = [
  {
    path: '/query/ip',
    exact: true,
    sidebarName: 'query.ip.activity',
    navbarName: 'query.ip.activity',
    icon: SearchIcon,
    component: () => <PageIpLookup />
  },
  {
    path: '/device/list',
    exact: true,
    sidebarName: 'query.devices.list',
    navbarName: 'query.devices.list',
    icon: DeviceIcon,
    component: () => <DeviceList />
  },
  // {
  //   path: '/device/find',
  //   exact: true,
  //   sidebarName: 'query.devices.findByIP',
  //   navbarName: 'query.devices.findByIP',
  //   icon: DeviceLookupIcon,
  //   component: () => <FindDevice />
  // }
];

export default routes;