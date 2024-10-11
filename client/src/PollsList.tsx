import React, { Component, MouseEvent } from 'react';
import { isRecord } from './record';
import { Poll, parsePoll } from './poll';


type PollsListProps = {
    onNewClick: () => void,
    onPollClick: (name: string) => void
};

type PollsListState = {
   timeNow: number 
   polls: Poll[] | undefined
};

// Shows the list of all the polls.
export class PollsList extends Component<PollsListProps, PollsListState> {

    constructor(props: PollsListProps) {
        super(props);
        this.state = {timeNow: Date.now(), polls: undefined};
    }

    componentDidMount = (): void => {
        this.doRefreshClick();
    }

    componentDidUpdate = (prevProps: PollsListProps): void => {
        if (prevProps !== this.props) {
          this.setState({timeNow: Date.now()}); 
        }
    };

    render = (): JSX.Element => {
        return (
          <div>
            <h2>Current Polls</h2>
            {this.renderPollsList()}
            <button type="button" onClick={this.doRefreshClick}>Refresh</button>
            <button type="button" onClick={this.doNewClick}>New Poll</button>
          </div>);
    };

    renderPollsList = (): JSX.Element => {
        if (this.state.polls === undefined) {
            return <p>Loading polls list...</p>;
          } else {
            const polls: JSX.Element[] = [];
            const endedPolls: JSX.Element[] = [];
            for (const poll of this.state.polls) {
              const min = (poll.endTime - this.state.timeNow) / 60 / 1000;
              const desc = (min <= 0) ? <span>  – closed {((min)*-1).toFixed(2)} minutes ago</span> :
                  <span>  – {min.toFixed(2)} minutes remaining</span>;
              if (min > 0){
                polls.push(
                    <li key={poll.name}>
                      <a href="#" onClick={(evt) => this.doPollClick(evt, poll.name)}>{poll.name}</a>
                      {desc}
                    </li>);
              } else {
                endedPolls.push(
                    <li key={poll.name}>
                      <a href="#" onClick={(evt) => this.doPollClick(evt, poll.name)}>{poll.name}</a>
                      {desc}
                    </li>);
              }
            }
          return <div><b>Still Open</b><ul>{polls}</ul> 
               <b>Closed</b><br></br><ul>{endedPolls}</ul></div>;
        }
    }

      doListResp = (resp: Response): void => {
        if (resp.status === 200) {
          resp.json().then(this.doListJson)
              .catch(() => this.doListError("200 response is not JSON"));
        } else if (resp.status === 400) {
          resp.text().then(this.doListError)
              .catch(() => this.doListError("400 response is not text"));
        } else {
          this.doListError(`bad status code from /api/list: ${resp.status}`);
        }
      };
    
      doListJson = (data: unknown): void => {
        if (!isRecord(data)) {
          console.error("bad data from /api/list: not a record", data);
          return;
        }
    
        if (!Array.isArray(data.pollsList)) {
          console.error("bad data from /api/list: polls is not an array", data);
          return;
        }
    
        const polls: Poll[] = [];
        for (const val of data.pollsList) {
          const poll = parsePoll(val);
          if (poll === undefined)
            return;
          polls.push(poll);
        }
        this.setState({polls: polls, timeNow: Date.now()});
      };
    
      doListError = (msg: string): void => {
        console.error(`Error fetching /api/list: ${msg}`);
      };
    
      doRefreshClick = (): void => {
        fetch("/api/list").then(this.doListResp)
            .catch(() => this.doListError("failed to connect to server"));
      };
    
      doNewClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
        this.props.onNewClick();  
      };
    
      doPollClick = (evt: MouseEvent<HTMLAnchorElement>, name: string): void => {
        evt.preventDefault();
        this.props.onPollClick(name);
      };

}