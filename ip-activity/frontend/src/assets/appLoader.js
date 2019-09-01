import React from 'react';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles';
import { BrowserRouter as Router, Route } from "react-router-dom";

import ErrorBoundary from './error'
import LeftDrawer from './leftDrawer';
import routes from './routes';

// Pages
import WelcomePage from '../components/pages/welcome';

const styles = theme => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    height: '100vh',
    overflow: 'auto',
  },
  chartContainer: {
    marginLeft: -22,
  },
  tableContainer: {
    height: 320,
  },
  h5: {
    marginBottom: theme.spacing.unit * 2,
  },
});

// Page hook
function Page () {
  const {t, i18n} = useTranslation();
  const changeLanguage = lng => {
    i18n.changeLanguage(lng);
  };
  
  return(
    <div className="App">
      <ErrorBoundary>
        <Router>
          <div style={{ display: "flex" }}>
            <LeftDrawer />
            <Route
              key="1000"
              path="/"
              exact={true}
              render={() => <WelcomePage />}
            />
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                exact={route.exact}
                render={route.component}
              />
            ))}
          </div>
        </Router>
      </ErrorBoundary>
    </div>
  );
}

// Catche App suspense from page in case translations are not yet loaded
export default function App() {
  return (
    <ErrorBoundary>
      <Page />
    </ErrorBoundary>
  );
}