import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import './App.css';
import AppRouter from './router';

const App = () => (
  <React.Fragment>
    <Router>
      <AppRouter />
    </Router>
  </React.Fragment>
);

export default App;
