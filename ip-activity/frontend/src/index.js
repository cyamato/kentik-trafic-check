import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from "history";
import "es6-promise";

import App from './app';

import './i18n';

ReactDOM.render(<App />, document.getElementById('root'));