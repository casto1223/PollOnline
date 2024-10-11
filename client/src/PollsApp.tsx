import React, { Component } from "react";
import { PollsList } from './PollsList';
import { NewPoll } from './NewPoll';
import { PollDetails } from "./PollDetails";

// Indicates which page to show. If it is the details page, the argument
// includes the specific poll to show the details of.
type Page = "list" | "new" | {kind: "details", name: string}; 

type PollsAppState = {
  page: Page;
}

/** Displays the UI of the Polls application. */
export class PollsApp extends Component<{}, PollsAppState> {

  constructor(props: {}) {
    super(props);

    this.state = {page: "list"};
  }
   
  render = (): JSX.Element => {
    if (this.state.page === "list"){
      return <PollsList onNewClick={this.doNewClick}
                        onPollClick={this.doPollClick}/>;
    } else if (this.state.page === "new"){
      return <NewPoll onBackClick={this.doBackClick}/>;
    } else {
      return <PollDetails name={this.state.page.name} 
                          onBackClick={this.doBackClick}/>;
    }
  };

  doNewClick = (): void => {
    this.setState({page: "new"});
  };
  
  doPollClick = (name: string): void => {
    this.setState({page: {kind: "details", name}});
  };
  
  doBackClick = (): void => {
    this.setState({page: "list"});
  };

}