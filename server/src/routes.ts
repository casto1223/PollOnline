import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";

// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;  // only writing, so no need to check

// RI: totalVotes = all the elements of optionVotes summed
//     options has the same indexing as optionVotes
//     voterNames has the same indexing as voterVotes
//     totalVotes >= 0
//     len(options) = len(optionVotes) 
//     len(voterNames) = len(voterVotes)
type Poll = {
  name: string
  endTime: number
  options: string[]
  optionVotes: number[]
  voterNames: string[]
  voterVotes: number[]
  totalVotes: number
};

// Map to store polls
const polls: Map<string, Poll> = new Map();
// hardcoded admin password needed to add and delete polls that only the admin(s) know
const password: string = "Cassandra1123";

/** Comparable, Polls with shorter remaining time < polls with longer remaining time. */
const comparePolls = (a: Poll, b: Poll): number => {
  const now: number = Date.now();
  const endA = now <= a.endTime ? a.endTime : 1e15 - a.endTime;
  const endB = now <= b.endTime ? b.endTime : 1e15 - b.endTime;
  return endA - endB;
};

/** Handles request for /api/add */
export const addPoll = (req: SafeRequest, res: SafeResponse): void => {
  const pw = req.body.password;
  if (typeof pw !== "string" || pw !== password) {
    res.status(400).send('missing or incorrect password');
    return;
  }

  const name = req.body.name;
  if (typeof name !== 'string') {
    res.status(400).send('required argument "name" was missing or faulty');
    return;
  }

  const endTime = req.body.endTime;
  if (typeof endTime !== 'number') {
    res.status(400).send('required argument "endTime" was missing or faulty');
    return;
  }

  const options = req.body.options;

  const check: Map<string, number> = new Map();

  if (Array.isArray(options)){
    for (const i of options){
      if (typeof i !== "string"){
        res.status(400).send('required argument "elements in options" was missing or faulty');
        return;
      }
      const j: string = i.trim();
      if (check.has(j)){
        res.status(400).send('options are not unique');
        return;
      } else {
        check.set(j, 1);
      }
    }
  } else {
    res.status(400).send('required argument "options" was missing or faulty');
    return;
  }

  const optionVotes = req.body.optionVotes;
  if (Array.isArray(optionVotes)){
    for (const i of optionVotes){
      if (typeof i !== "number"){
        res.status(400).send('required argument "elements in optionVotes" was missing or faulty');
        return;
      }
    }
  } else {
    res.status(400).send('required argument "optionVotes" was missing or faulty');
    return;
  }

  const voterNames = req.body.voterNames;
  if (Array.isArray(voterNames)){
    if (voterNames.length !== 0){
      res.status(400).send('required argument "elements in voterNames" was missing or faulty');
      return;
    }
  } else {
    res.status(400).send('required argument "voterNames" was missing or faulty');
    return;
  }

  const voterVotes = req.body.voterVotes;
  if (Array.isArray(voterVotes)){
    if (voterVotes.length !== 0){
      res.status(400).send('required argument "elements in voterVotes" was missing or faulty');
      return;
    }
  } else {
    res.status(400).send('required argument "voterVotes" was missing or faulty');
    return;
  }

  const totalVotes = req.body.totalVotes;
  if (typeof totalVotes !== 'number' || totalVotes < 0) {
    res.status(400).send('required argument "totalVotes" was missing or faulty');
    return;
  }

  if (polls.has(name)) {
    res.status(400).send(`poll for '${name}' already exists`);
    return;
  }

  const poll = {
    name: name, 
    endTime: Date.now() + endTime * 60 * 1000,
    options: options,
    optionVotes: optionVotes,
    voterNames: voterNames,
    voterVotes: voterVotes,
    totalVotes: totalVotes
  };

  polls.set(name, poll);
  res.send({poll: poll});
};

/** Handles request for /api/list */
export const listPolls = (_req: SafeRequest, res: SafeResponse): void => {
  const vals = Array.from(polls.values());
  vals.sort(comparePolls);
  res.send({pollsList: vals});
};

/** Handles request for /api/get */
export const getPoll = (req: SafeRequest, res: SafeResponse): void => {
  const pollName = first(req.query.name);
  if (typeof pollName !== "string") {
    res.status(400).send('did not provide a valid name');
    return;
  }
  if (!polls.has(pollName)) {
    res.status(404).send('no poll of the given name exists');
    return;
  } 
  
  res.send({poll: polls.get(pollName)});
};


// Helper to return the (first) value of the parameter if any was given.
const first = (param: unknown): string|undefined => {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
};

/** Handles requests for /api/vote */ 
export const votePoll = (req: SafeRequest, res: SafeResponse): void => {
  const pollName = req.body.name;
  if (typeof pollName !== "string") {
    res.status(400).send('missing or invalid poll name');
    return;
  }

  const poll = polls.get(pollName);
  if (poll === undefined){
    res.status(400).send(`no poll with name '${pollName}'`);
    return;
  }

  const now = Date.now();
  if (now >= poll.endTime) {
    res.status(400).send('poll has already ended');
    return;
  }

  const voter = req.body.voter;
  if (typeof voter !== "string") {
    res.status(400).send('missing or invalid voter name');
    return;
  }

  const voterChoice = req.body.choice;
  if (typeof voterChoice !== "number" || voterChoice >= poll.options.length) {
    res.status(400).send('missing or invalid voter vote');
    return;
  }

  let ind = 0;
  let isFound: boolean = false;

  for (const n of poll.voterNames){
    if (n === voter){ 
      const prevVote = poll.voterVotes[ind];
      poll.voterVotes[ind] = voterChoice;
      poll.optionVotes[prevVote] = poll.optionVotes[prevVote]-1;
      poll.optionVotes[voterChoice] = poll.optionVotes[voterChoice]+1;
      isFound = true;
    } 
    ind = ind+1;
  }

  if (!isFound){
    poll.voterNames.push(voter);
    poll.voterVotes.push(voterChoice);
    poll.optionVotes[voterChoice] = poll.optionVotes[voterChoice]+1;
    poll.totalVotes = poll.totalVotes+1;
  }
  
  res.send({poll: poll});
};

/** handles requests for /api/delete */
export const deletePoll = (req: SafeRequest, res: SafeResponse): void => {
  const pw = req.body.password;
  if (typeof pw !== "string" || pw !== password) {
    res.status(400).send('missing or incorrect password');
    return;
  }

  const pollName = req.body.name;
  if (typeof pollName !== "string") {
    res.status(400).send('missing or invalid poll name');
    return;
  }

  polls.delete(pollName);
  res.send({deleted: true});
};


/** Used in tests to set the polls map back to empty. */
export const resetPollsForTesting = (): void => {
  polls.clear();
};

/** Testing function to move all end times forward the given amount (of ms). */
export const advanceTimeForTesting = (ms: number): void => {
  for (const poll of polls.values()) {
    poll.endTime -= ms;
  }
};