import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import routes from './routes';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';

// React Elements
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

// Icons
import MenuIcon from '@material-ui/icons/MenuOutlined';
import TranslateIcon from '@material-ui/icons/TranslateOutlined';

// i11n Translation
import { withTranslation } from 'react-i18next';
import i18n from 'i18next';

function PaperComponent(props) {
  return (
    <Draggable>
      <Paper {...props} />
    </Draggable>
  );
}

const drawerWidth = 240;

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
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
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
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9,
    },
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
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
});

class SwipeableTemporaryDrawerLegacy extends React.Component {
  constructor(props) {
    super(props);
    this.state.languages = i18n.languages;
    this.state.langauge = i18n.language;
  }
  
  state = {
    top: false,
    left: false,
    bottom: false,
    right: false,
    langauge: "",
    languages: [],
    open: false,
  };
  
  handleChange = event => {
    i18n.changeLanguage(event.target.value)
    .then(() => {
      window.localStorage.setItem('langauge', event.target.value);
      this.setState({
        langauge: event.target.value,
        open: false,
      });
    })
    .catch((err) => {
      console.log(err);
    });
  };
  
  handleClickOpen = () => {
    this.setState({ open: true });
  };
  
  handleClose = () => {
    this.setState({ open: false });
  };
  
  toggleDrawer = (side, open) => () => {
    this.setState({
      [side]: open,
    });
  };
  
  render() {
    const { classes } = this.props;
    const { t } = this.props;
    
    return (
      <div>
        <Button onClick={this.toggleDrawer('left', true)}><MenuIcon /></Button>
        <SwipeableDrawer
          open={this.state.left}
          onClose={this.toggleDrawer('left', false)}
          onOpen={this.toggleDrawer('left', true)}
        >
          <div
            tabIndex={0}
            role="button"
            onClick={this.toggleDrawer('left', false)}
            onKeyDown={this.toggleDrawer('left', false)}
          >
            <MenuList>
              <Link to="/" key="1000">
                <MenuItem>
                  <ListItemIcon>
                    <img src="/favicon-ibm.jpeg" alt="Logo" width="24px" height="24px" />
                  </ListItemIcon>
                  <ListItemText primary={t('top.title')} />
                </MenuItem>
              </Link>
              <Divider />
              {routes.map((prop, key) => {
                return (
                  <Link to={prop.path} key={key}>
                    <MenuItem>
                      <ListItemIcon>
                        <prop.icon />
                      </ListItemIcon>
                      <ListItemText primary={t(prop.sidebarName)} />
                    </MenuItem>
                  </Link>
                );
              })}
              <Divider />
              <MenuItem>
                <ListItemIcon>
                  <TranslateIcon />
                </ListItemIcon>
                <Button variant="outlined" color="primary" onClick={this.handleClickOpen}>
                  {t("top.lngSelector")}
                </Button>
              </MenuItem>
            </MenuList>
          </div>
        </SwipeableDrawer>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="draggable-dialog-title"
          PaperComponent={PaperComponent}
        >
          <DialogTitle id="draggable-dialog-title">{t("top.lngSelector")}</DialogTitle>
          <DialogContent>
            <Select
              value={this.state.langauge}
              onChange={this.handleChange}
            >
              <MenuItem value="en-US">English</MenuItem>
              <MenuItem value="es">Español</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="ja">日本の</MenuItem>
              <MenuItem value="cn">中文</MenuItem>
            </Select>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

const SwipeableTemporaryDrawer = withTranslation()(SwipeableTemporaryDrawerLegacy);

SwipeableTemporaryDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SwipeableTemporaryDrawer);