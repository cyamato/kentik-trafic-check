import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';

// React Elements
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';

// Icons

// i11n Translation
import i18n from 'i18next';

const styles = theme => ({
  title: {
    flexGrow: 1,
  },
});

function PaperComponent(props) {
  return (
    <Draggable>
      <Paper {...props} />
    </Draggable>
  );
}

class languageSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state.languages = i18n.languages;
    this.state.langauge = i18n.language;
  }
  
  state = {
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
  
  render() {
    const { classes } = this.props;
    return (
      <div>
        <Button variant="outlined" color="primary" onClick={this.handleClickOpen}>
          {this.props.title}
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="draggable-dialog-title"
          PaperComponent={PaperComponent}
        >
          <DialogTitle id="draggable-dialog-title">{this.props.title}</DialogTitle>
          <DialogContent>
            <Select
              value={this.state.langauge}
              onChange={this.handleChange}
            >
              <MenuItem value="en-US">English</MenuItem>
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

languageSelector.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(languageSelector);