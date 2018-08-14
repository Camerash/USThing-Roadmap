import React, { Component } from 'react';
import {Badge, Heading, Icon} from 'usthing-ui'
import Timeline from './react-calendar-timeline'
import { Emojione } from 'react-emoji-render'
import moment from 'moment'
import logo from './logo.svg'
import './Timeline.css'
import './App.css';

const groups = [{ id: 1, title: 'Marketplace', color:'#4d6aaa' }, { id: 2, title: 'Community', color:'#0c876e' }]

const items = [
  {
    id: 1,
    group: 1,
    title: 'Development in progress',
    start_time: moment().month(6).startOf('month'),
    end_time: moment().month(7).endOf('month')
  },
  {
    id: 2,
    group: 1,
    title: 'Internal testing',
    start_time: moment().month(8).startOf('month'),
    end_time: moment().month(8).date(15).endOf('day')
  },
  {
    id: 3,
    group: 2,
    title: 'Milestone 1: Basic chat',
    start_time: moment().month(6).date(10).startOf('day'),
    end_time: moment().month(7).date(4).endOf('day')
  },
  {
    id: 4,
    group: 2,
    title: 'Milestone 2: Discover',
    start_time: moment().month(7).date(5).startOf('day'),
    end_time: moment().month(7).date(18).endOf('day')
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
            lineHeight={80}
            minZoom={864000000}
            timeStep={
              {
                second: 60,
                minute: 15,
                hour: 1,
                day: 1,
                month: 1,
                year: 1
              }
            }
            canMove={false}
            canResize={false}
            sidebarContent={<div className="Emoji-header"><Emojione className="Emoji-text" text="Projects :clipboard:"></Emojione></div>}
            defaultTimeStart={moment().startOf('month')}
            defaultTimeEnd={moment().startOf('month').add(2, 'M')}
          />
        </div>
      </div>
    );
  }
}

export default App;
