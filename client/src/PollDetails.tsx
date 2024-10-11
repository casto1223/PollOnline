import React, { Component, ChangeEvent } from 'react';
import { isRecord } from './record';
import { Poll, parsePoll } from './poll';


type PollDetailsProps = {
  name: string,
  onBackClick: () => void,
};

type PollDetailsState = {
  poll: Poll | undefined
  voterName?: string
  optionChoice?: number
  timeNow: number
  message: string
  error: string
  password?: string
  deleting: boolean
};

export class PollDetails extends Component<PollDetailsProps, PollDetailsState> {

  constructor(props: PollDetailsProps) {
    super(props);

    this.state = {poll: undefined, timeNow: Date.now(), error: "", message: "", deleting: false};
  }

  componentDidMount = (): void => {
    this.doRefreshClick(this.props.name); 
  };

  render = (): JSX.Element => {
    if (this.state.poll === undefined) {
      return <p>Loading poll... "{this.props.name}"...</p>
    } else {
      if (this.state.poll.endTime <= this.state.timeNow) {
        return this.renderCompleted(this.state.poll);
      } else {
        return this.renderOngoing(this.state.poll);
      }
    }
  }

  renderCompleted = (poll: Poll): JSX.Element => {
    const voteOptionsResults: JSX.Element[] = [];
    for (const i of poll.options){
      const num = isNaN(Math.floor((poll.optionVotes[poll.options.indexOf(i)]/poll.totalVotes)*100.0)) ? 
      0.0 : Math.floor((poll.optionVotes[poll.options.indexOf(i)]/poll.totalVotes)*100.0)
      const percent: string = "" + num + "%";
      voteOptionsResults.push(<li>{percent} – {i}</li>);
    }

    return (
      <div>
        <h2>{poll.name}</h2>
        <i>Poll closed {(-1*(poll.endTime - Date.now())/60/1000).toFixed(2)} minutes ago!</i>
        <br></br>
        <br></br>
        <div>{voteOptionsResults}</div>
        <br></br>
        <button type="button" onClick={this.doBackClick}>Back</button>
        <button type="button" onClick={(evt) => this.doRefreshClick(this.props.name)}>Refresh</button>
        <button type="button" onClick={this.doDeleteClick}>Delete</button>
        {this.renderDelete()}
      </div>
    )

  }

  renderOngoing = (poll: Poll): JSX.Element => {
    const voteOptions: JSX.Element[] = [];
    for (const i of poll.options){
      const ind: number = poll.options.indexOf(i);
      voteOptions.push(<div><input type="radio" id={"item " + ind} name="item" value={ind}
      onChange={(evt) => this.doOptionClick(ind)}/>
      <label htmlFor={"item " + ind}>{i}</label>
      </div>);
    }

    const closingMessage: JSX.Element = Math.floor((poll.endTime - Date.now())/60/1000) <= 1 ? 
    <i>Poll closes in less than {Math.floor((poll.endTime - Date.now())/60/1000)} minute...</i> : 
    <i>Poll closes in {Math.floor((poll.endTime - Date.now())/60/1000)} minutes...</i>;

    return (
      <div>
        <h2>{poll.name}</h2>
        {closingMessage} 
        <br></br>
        <br></br>
        <div>{voteOptions}</div>
        <br></br>
        <label htmlFor="name">Voter Name: </label>
              <input id="name" type="text" value={this.state.voterName}
              onChange={this.doVoterNameChange}/>
        <br></br>
        <br></br>
        <button type="button" onClick={this.doBackClick}>Back</button>
        <button type="button" onClick={(evt) => this.doRefreshClick(this.props.name)}>Refresh</button>
        <button type="button" onClick={this.doVoteClick}>Vote</button>
        <button type="button" onClick={this.doDeleteClick}>Delete</button>
        {this.renderDelete()}
        {this.renderError()}
        <br></br>
        {this.renderMessage()}
      </div>
    )
  }

  renderError = (): JSX.Element => {
    if (this.state.error.length === 0) {
      return <div></div>;
    } else {
      const style = {width: '300px', backgroundColor: 'rgb(246,194,192)',
          border: '1px solid rgb(137,66,61)', borderRadius: '5px', padding: '5px' };
      return (<div style={{marginTop: '15px'}}>
          <span style={style}><b>Error: </b>: {this.state.error}</span>
        </div>);
    }
  };

  renderMessage = (): JSX.Element => {
    if (this.state.message.length === 0){
      return <div></div>
    } else {
      return <div>{this.state.message}</div>
    }
  }

  renderDelete = (): JSX.Element => {
    if (!this.state.deleting){
      return <div></div>
    } else {
      return <div><br></br><label htmlFor="password">Enter Admin Password: </label>
      <input id="password" type="password" value={this.state.password}
      onChange={this.doPasswordChange}/>
      <button type="button" onClick={evt => this.doDeleteConfirmClick(this.state.password)}>Confirm</button></div>
    }
  }

  doPasswordChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({password: evt.target.value, error: ""});
  };

  doDeleteClick = (): void => {
    this.setState({deleting: !this.state.deleting})
  }

  
  doDeleteConfirmClick = (pw: string | undefined): void => {
    if (pw === undefined || pw === ""){
      this.setState({error: "enter admin password."})
      return;
    }
    const args = {password: pw, name: this.props.name};
    fetch("/api/delete", {
      method: "POST", body: JSON.stringify(args),
      headers: {"Content-Type": "application/json"} })
    .then(this.doDeleteResp)
    .catch(() => this.doDeleteError("failed to connect to server"));
  }

  doDeleteResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doDeleteJson)
          .catch(() => this.doDeleteError("200 response is not JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doDeleteError)
          .catch(() => this.doDeleteError("400 response is not text"));
    } else {
      this.doDeleteError(`bad status code from /api/delete: ${res.status}`);
    }
  };

  doDeleteJson = (data: unknown): void => {
    if (this.state.poll === undefined)
      throw new Error("impossible");

    if (!isRecord(data)) {
      console.error("bad data from /api/delete: not a record", data);
      return;
    }
    this.props.onBackClick(); 

  };

  doDeleteError = (msg: string): void => {
    console.error(`Error fetching /api/delete: ${msg}`);
  };
  
  doVoteClick = (): void => {
    this.setState({timeNow: Date.now()});

    if (this.state.poll === undefined)
      throw new Error("impossible");

    if (this.state.timeNow >= this.state.poll.endTime){
      this.setState({error: "poll has ended."});
      return;
    }

    if (this.state.optionChoice === undefined) {
      this.setState({error: "no choice selected."})
      return;
    }
    
    if (this.state.voterName === undefined || this.state.voterName.trim().length === 0){
      this.setState({error: "voter name is missing."})
      return;
    } 

    const args = {name: this.props.name, voter: this.state.voterName, choice: this.state.optionChoice};
    fetch("/api/vote", {
      method: "POST", body: JSON.stringify(args),
      headers: {"Content-Type": "application/json"} })
    .then(this.doVoteResp)
    .catch(() => this.doVoteError("failed to connect to server"));

  };

  doVoteResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doVoteJson)
          .catch(() => this.doVoteError("200 response is not JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doVoteError)
          .catch(() => this.doVoteError("400 response is not text"));
    } else {
      this.doVoteError(`bad status code from /api/vote: ${res.status}`);
    }
  };

  doVoteJson = (data: unknown): void => {
    if (this.state.poll === undefined)
      throw new Error("impossible");

    if (!isRecord(data)) {
      console.error("bad data from /api/vote: not a record", data);
      return;
    }

    
    if (this.state.optionChoice === undefined){
      throw new Error("impossible"); 
    }
    
    this.setState({message: "Recorded vote of \"" + this.state.voterName + "\" as \"" + this.state.poll.options[this.state.optionChoice] + "\""});

  };

  doVoteError = (msg: string): void => {
    console.error(`Error fetching /api/vote: ${msg}`);
  };

  doBackClick = (): void => {
    this.props.onBackClick();
  };

  doRefreshClick = (i: string): void => {
    fetch("/api/get?name="+i)
      .then(this.doGetResp)
      .catch(() => this.doGetError("failed to connect to server"));
  };

  doGetResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doGetJson)
          .catch(() => this.doGetError("200 res is not JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doGetError)
          .catch(() => this.doGetError("400 response is not text"));
    } else {
      this.doGetError(`bad status code from /api/refersh: ${res.status}`);
    }
  };

  doGetJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /api/refresh: not a record", data);
      return;
    }

    this.doPollChange(data);
  };

  doPollChange = (data: {poll?: unknown}): void => {
    const poll = parsePoll(data.poll);
    if (poll === undefined) {
      console.error("poll from /api/refresh did not parse", data.poll)
    } else {
      this.setState({poll: poll, timeNow: Date.now(), error: ""});
    }
  };

  doVoterNameChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({voterName: evt.target.value});
  };

  doGetError = (msg: string): void => {
    console.error(`Error fetching /api/refresh: ${msg}`);
  };

  doOptionClick = (index: number): void => {
    this.setState({optionChoice: index});
  };

}