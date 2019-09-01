/* global fetch */
/* global ZC */
/* global index */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

// i11n Translation
import { withTranslation } from 'react-i18next';

const styles = theme => ({
  root: {
    flexGrow: 1,
    'text-align': 'center',
    width: '100%',
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
  centerLookup: {
    'text-align': 'center',
    'width': '100%',
  },
});

class welcomeLegacy extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    const { classes } = this.props;
    const { t } = this.props;
    
    return(
      <div>
        <img src="/favicon-ibm.jpeg" alt="Logo" width="80px" height="80px" />
        <br />
        <Typography variant="subtitle2" gutterBottom>
          {t('top.welcome')}
        </Typography>
      </div>
    );
  }
}

const welcome = withTranslation()(welcomeLegacy);

welcome.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(welcome);