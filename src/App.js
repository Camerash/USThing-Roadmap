import React, { Component } from 'react';
import {Badge, Heading, Icon} from 'usthing-ui'
import Timeline from './react-calendar-timeline'
import moment from 'moment'
import logo from './logo.svg'
import './Timeline.css'
import './App.css';

const groups = [{ id: 1, title: 'group 1' }, { id: 2, title: 'group 2' }]

const items = [
  {
    id: 1,
    group: 1,
    title: 'item 1',
    start_time: moment(),
    end_time: moment().add(1, 'hour')
  },
  {
    id: 2,
    group: 2,
    title: 'item 2',
    start_time: moment().add(-0.5, 'hour'),
    end_time: moment().add(0.5, 'hour')
  },
  {
    id: 3,
    group: 1,
    title: 'item 3',
    start_time: moment().add(2, 'hour'),
    end_time: moment().add(3, 'hour')
  }
]


class App extends Component {
  render() {
    return (
      <div>
        <img src={logo} className="Header-logo"/>
        <Heading className="Header Header-title">
          Roadmap
          <Badge className="Header-badge">
            BETA
          </Badge>
        </Heading>
        <div className="Calendar">
          <Timeline
            groups={groups}
            items={items}
            defaultTimeStart={moment().add(-12, 'hour')}
            defaultTimeEnd={moment().add(12, 'hour')}
          />
        </div>
      </div>
    );
  }
}

export default App;
