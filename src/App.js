import React, { Component } from 'react';
import logo from './logo.svg'
import './App.css';
import {Badge, Heading} from 'usthing-ui'

class App extends Component {
  render() {
    return (
      <div className="Header">
      <img src={logo} className="Header-logo"/>
        <Heading className="Header-title">
          Roadmap
          <Badge className="Header-badge">
            BETA
          </Badge>
        </Heading>
      </div>
    );
  }
}

export default App;
