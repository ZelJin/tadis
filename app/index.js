import React from 'react';
import { render } from 'react-dom';
import { Router, hashHistory } from 'react-router';
import routes from './routes';
import fixPath from 'fix-path';
import './app.global.css';

var jQuery = require('jquery');
window.$ = window.jQuery = jQuery;
var bootstrap = require('bootstrap');

fixPath();

render(
  <Router history={hashHistory} routes={routes} />,
  document.getElementById('root')
);
