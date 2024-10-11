import React, { Component, ChangeEvent, MouseEvent } from 'react';
import { isRecord } from './record';


type NewPollProps = {
  onBackClick: () => void
};

type NewPollState = {
  name: string
  minutes: string
  options: string
  error: string
  password?: string
  adding: boolean
};

export class NewPoll extends Component<NewPollProps, NewPollState> {

    constructor(props: NewPollProps) {
      super(props);
      this.state = {name: "", minutes: "",
                    options: "", error: "", adding: false};
    }

    render = (): JSX.Element => {
        return (
        <div>
            <h2>New Poll</h2>
            <br></br>
            <label htmlFor="name">Name: </label>
            <input id="name" type="text" value={this.state.name}
            onChange={this.doNameChange}/>
            <br/>
            <label htmlFor="num">Minutes: </label>
            <input type="number" id="num" name="quantity" min="1" value={this.state.minutes} onChange={this.doMinutesChange}></input>
            <br/>
            <label htmlFor="textbox">Options: (one per line, minimum 2 lines, no duplicates)</label>
            <br/>
            <textarea id="textbox" rows={3} cols={40} value={this.state.options}
            onChange={this.doOptionsChange}></textarea>
            <br/>
            <button type="button" onClick={this.doCreateClick}>Create</button>
            <button type="button" onClick={this.doBackClick}>Back</button>
            <br/>
            {this.renderAdd()}
            {this.renderError()}
        </div> )
        
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

    renderAdd = (): JSX.Element => {
        if (!this.state.adding){
          return <div></div>
        } else {
          return <div><br></br><label htmlFor="password">Enter Admin Password: </label>
          <input id="password" type="password" value={this.state.password}
          onChange={this.doPasswordChange}/>
          <button type="button" onClick={evt => this.doCreateConfirmClick(this.state.password)}>Confirm</button></div>
        }
    };

    doPasswordChange = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({password: evt.target.value, error: ""});
    };

    doNameChange = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({name: evt.target.value, error: ""});
    };

    doMinutesChange = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({minutes: evt.target.value, error: ""});
    };

    doOptionsChange = (evt: ChangeEvent<HTMLTextAreaElement>): void => {
        this.setState({options: evt.target.value, error: ""});
    };

    doCreateClick = (): void => {
        this.setState({adding: !this.state.adding});
    }

    doCreateConfirmClick = (pw: string | undefined): void => {
        const temp: string[] = this.state.options.split("\n");

        for (const x of temp){
            if (x.trim().length === 0){
                this.setState({error: "options cannot be empty or only whitespaces."});
                return;
            }
        }
        
        if (this.state.name.trim().length === 0 ||
            this.state.minutes.trim().length === 0 ||
            temp.length === 0){
            this.setState({error: "a required field is missing or invalid."})
            return;
        }

        if (temp.length < 2){
            this.setState({error: "requires a minimum of 2 options."})
            return; 
        }

        const minutes = parseFloat(this.state.minutes);
        if (isNaN(minutes) || minutes < 1 || Math.floor(minutes) !== minutes) {
            this.setState({error: "minutes is not a positive integer"});
            return;
        }
        
        const optionVotes: number[] = []
        for (const i of temp){
            optionVotes.push(0);
        }

        const args = {password: pw, name: this.state.name, endTime: minutes, options: temp, optionVotes: optionVotes, voterNames: []
        , voterVotes: [], totalVotes: 0};
        fetch("/api/add", {
            method: "POST", body: JSON.stringify(args),
            headers: {"Content-Type": "application/json"} })
          .then(this.doAddResp)
          .catch(() => this.doAddError("failed to connect to server"));
    };

    doAddResp = (resp: Response): void => {
        if (resp.status === 200) {
          resp.json().then(this.doAddJson)
              .catch(() => this.doAddError("200 response is not JSON"));
        } else if (resp.status === 400) {
          resp.text().then(this.doAddError)
              .catch(() => this.doAddError("400 response is not text"));
        } else {
          this.doAddError(`bad status code from /api/add: ${resp.status}`);
        }
    };

    doAddJson = (data: unknown): void => {
        if (!isRecord(data)) {
          console.error("bad data from /api/add: not a record", data);
          return;
        }
    
        this.props.onBackClick(); 
    };

    doAddError = (msg: string): void => {
        this.setState({error: msg})
    };

    doBackClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
        this.props.onBackClick();  
    };
}  