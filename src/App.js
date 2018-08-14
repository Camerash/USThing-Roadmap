import React, { Component } from 'react';
import {Badge, Heading, Icon} from 'usthing-ui'
import Timeline from './react-calendar-timeline'
import { Emojione } from 'react-emoji-render'
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
  componentDidMount() {
    setTimeout(function() { // Delay before setting initial range
      this.timeline.showPeriod(moment().startOf('month'), 'month', 2)
    }.bind(this), 0)
  }
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
            ref={(timeline) => { this.timeline = timeline; }}
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
            sidebarContent={<div className="Emoji-header"><Emojione className="Emoji-text" text="Projects :clipboard:"></Emojione></div>}
            defaultTimeStart={moment().startOf('month')}
            defaultTimeEnd={moment().startOf('month').add(1, 'M')}
          />
        </div>
      </div>
    );
  }
}

export default App;
