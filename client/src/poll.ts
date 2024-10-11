import { isRecord } from "./record";


// Description/values of a Poll object
// RI: totalVotes = all the elements of optionVotes summed
//     options has the same indexing as optionVotes
//     voterNames has the same indexing as voterVotes
//     totalVotes >= 0
//     len(options) = len(optionVotes) 
//     len(voterNames) = len(voterVotes)
export type Poll = {
  readonly name: string
  readonly endTime: number
  readonly options: string[]
  readonly optionVotes: number[]
  readonly voterNames: string[]
  readonly voterVotes: number[]
  readonly totalVotes: number
};


/**
 * Parses unknown data into a poll. Will log an error and return undefined
 * if it is not a valid poll.
 * @param val unknown data to parse into a poll
 * @return poll if val is a valid poll and undefined otherwise
 */
export const parsePoll = (val: unknown): undefined | Poll => {
  if (!isRecord(val)) {
    console.error("not a poll", val)
    return undefined;
  }

  if (typeof val.name !== "string") {
    console.error("not a poll: missing 'name'", val)
    return undefined;
  }

  if (typeof val.endTime !== "number" || val.endTime < 0 || isNaN(val.endTime)) {
    console.error("not a poll: missing or invalid 'endTime'", val)
    return undefined;
  }

  if (typeof val.totalVotes !== "number" || val.totalVotes < 0 || isNaN(val.totalVotes)) {
    console.error("not a poll: missing or invalid 'totalvotes'", val)
    return undefined;
  }

  if (Array.isArray(val.options)){
    for (const i of val.options){
      if (typeof i !== "string"){
        console.error("not a poll: missing or invalid 'elements in options'", val);
        return undefined;
      }
    }
  } else {
    console.error("not a poll: missing or invalid 'options'", val)
    return undefined;
  }

  if (Array.isArray(val.optionVotes)){
    for (const i of val.optionVotes){
      if (typeof i !== "number"){
        console.error("not a poll: missing or invalid 'elements in optionVotes'", val);
        return undefined;
      }
    }
  } else {
    console.error("not a poll: missing or invalid 'optionVotes'", val)
    return undefined;
  }

  if (Array.isArray(val.voterNames)){
    if (val.voterNames.length !== 0){
      for (const i of val.voterNames){
        if (typeof i !== "string"){
          console.error("not a poll: missing or invalid 'elements in voterNames'", val);
          return undefined;
        }
      }
    }
  } else {
    console.error("not a poll: missing or invalid 'voterNames'", val)
    return undefined;
  }
  
  if (Array.isArray(val.voterVotes)){
    if (val.voterVotes.length !== 0){
      for (const i of val.voterVotes){
        if (typeof i !== "number"){
          console.error("not a poll: missing or invalid 'elements in voterVotes'", val);
          return undefined;
        }
      }
    }
  } else {
    console.error("not a poll: missing or invalid 'voterVotes'", val)
    return undefined;
  }

  return {
    name: val.name, endTime: val.endTime, options: val.options, optionVotes: val.optionVotes, 
    voterNames: val.voterNames, voterVotes: val.voterVotes, totalVotes: val.totalVotes
  };
};