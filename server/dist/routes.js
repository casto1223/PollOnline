"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.advanceTimeForTesting = exports.resetPollsForTesting = exports.deletePoll = exports.votePoll = exports.getPoll = exports.listPolls = exports.addPoll = void 0;
// Map to store polls
var polls = new Map();
// hardcoded admin password needed to add and delete polls that only the admin(s) know
var password = "Cassandra1123";
/** Comparable, Polls with shorter remaining time < polls with longer remaining time. */
var comparePolls = function (a, b) {
    var now = Date.now();
    var endA = now <= a.endTime ? a.endTime : 1e15 - a.endTime;
    var endB = now <= b.endTime ? b.endTime : 1e15 - b.endTime;
    return endA - endB;
};
/** Handles request for /api/add */
var addPoll = function (req, res) {
    var e_1, _a, e_2, _b;
    var pw = req.body.password;
    if (typeof pw !== "string" || pw !== password) {
        res.status(400).send('missing or incorrect password');
        return;
    }
    var name = req.body.name;
    if (typeof name !== 'string') {
        res.status(400).send('required argument "name" was missing or faulty');
        return;
    }
    var endTime = req.body.endTime;
    if (typeof endTime !== 'number') {
        res.status(400).send('required argument "endTime" was missing or faulty');
        return;
    }
    var options = req.body.options;
    var check = new Map();
    if (Array.isArray(options)) {
        try {
            for (var options_1 = __values(options), options_1_1 = options_1.next(); !options_1_1.done; options_1_1 = options_1.next()) {
                var i = options_1_1.value;
                if (typeof i !== "string") {
                    res.status(400).send('required argument "elements in options" was missing or faulty');
                    return;
                }
                var j = i.trim();
                if (check.has(j)) {
                    res.status(400).send('options are not unique');
                    return;
                }
                else {
                    check.set(j, 1);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (options_1_1 && !options_1_1.done && (_a = options_1.return)) _a.call(options_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    else {
        res.status(400).send('required argument "options" was missing or faulty');
        return;
    }
    var optionVotes = req.body.optionVotes;
    if (Array.isArray(optionVotes)) {
        try {
            for (var optionVotes_1 = __values(optionVotes), optionVotes_1_1 = optionVotes_1.next(); !optionVotes_1_1.done; optionVotes_1_1 = optionVotes_1.next()) {
                var i = optionVotes_1_1.value;
                if (typeof i !== "number") {
                    res.status(400).send('required argument "elements in optionVotes" was missing or faulty');
                    return;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (optionVotes_1_1 && !optionVotes_1_1.done && (_b = optionVotes_1.return)) _b.call(optionVotes_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    else {
        res.status(400).send('required argument "optionVotes" was missing or faulty');
        return;
    }
    var voterNames = req.body.voterNames;
    if (Array.isArray(voterNames)) {
        if (voterNames.length !== 0) {
            res.status(400).send('required argument "elements in voterNames" was missing or faulty');
            return;
        }
    }
    else {
        res.status(400).send('required argument "voterNames" was missing or faulty');
        return;
    }
    var voterVotes = req.body.voterVotes;
    if (Array.isArray(voterVotes)) {
        if (voterVotes.length !== 0) {
            res.status(400).send('required argument "elements in voterVotes" was missing or faulty');
            return;
        }
    }
    else {
        res.status(400).send('required argument "voterVotes" was missing or faulty');
        return;
    }
    var totalVotes = req.body.totalVotes;
    if (typeof totalVotes !== 'number' || totalVotes < 0) {
        res.status(400).send('required argument "totalVotes" was missing or faulty');
        return;
    }
    if (polls.has(name)) {
        res.status(400).send("poll for '".concat(name, "' already exists"));
        return;
    }
    var poll = {
        name: name,
        endTime: Date.now() + endTime * 60 * 1000,
        options: options,
        optionVotes: optionVotes,
        voterNames: voterNames,
        voterVotes: voterVotes,
        totalVotes: totalVotes
    };
    polls.set(name, poll);
    res.send({ poll: poll });
};
exports.addPoll = addPoll;
/** Handles request for /api/list */
var listPolls = function (_req, res) {
    var vals = Array.from(polls.values());
    vals.sort(comparePolls);
    res.send({ pollsList: vals });
};
exports.listPolls = listPolls;
/** Handles request for /api/get */
var getPoll = function (req, res) {
    var pollName = first(req.query.name);
    if (typeof pollName !== "string") {
        res.status(400).send('did not provide a valid name');
        return;
    }
    if (!polls.has(pollName)) {
        res.status(404).send('no poll of the given name exists');
        return;
    }
    res.send({ poll: polls.get(pollName) });
};
exports.getPoll = getPoll;
// Helper to return the (first) value of the parameter if any was given.
var first = function (param) {
    if (Array.isArray(param)) {
        return first(param[0]);
    }
    else if (typeof param === 'string') {
        return param;
    }
    else {
        return undefined;
    }
};
/** Handles requests for /api/vote */
var votePoll = function (req, res) {
    var e_3, _a;
    var pollName = req.body.name;
    if (typeof pollName !== "string") {
        res.status(400).send('missing or invalid poll name');
        return;
    }
    var poll = polls.get(pollName);
    if (poll === undefined) {
        res.status(400).send("no poll with name '".concat(pollName, "'"));
        return;
    }
    var now = Date.now();
    if (now >= poll.endTime) {
        res.status(400).send('poll has already ended');
        return;
    }
    var voter = req.body.voter;
    if (typeof voter !== "string") {
        res.status(400).send('missing or invalid voter name');
        return;
    }
    var voterChoice = req.body.choice;
    if (typeof voterChoice !== "number" || voterChoice >= poll.options.length) {
        res.status(400).send('missing or invalid voter vote');
        return;
    }
    var ind = 0;
    var isFound = false;
    try {
        for (var _b = __values(poll.voterNames), _c = _b.next(); !_c.done; _c = _b.next()) {
            var n = _c.value;
            if (n === voter) {
                var prevVote = poll.voterVotes[ind];
                poll.voterVotes[ind] = voterChoice;
                poll.optionVotes[prevVote] = poll.optionVotes[prevVote] - 1;
                poll.optionVotes[voterChoice] = poll.optionVotes[voterChoice] + 1;
                isFound = true;
            }
            ind = ind + 1;
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_3) throw e_3.error; }
    }
    if (!isFound) {
        poll.voterNames.push(voter);
        poll.voterVotes.push(voterChoice);
        poll.optionVotes[voterChoice] = poll.optionVotes[voterChoice] + 1;
        poll.totalVotes = poll.totalVotes + 1;
    }
    res.send({ poll: poll });
};
exports.votePoll = votePoll;
/** handles requests for /api/delete */
var deletePoll = function (req, res) {
    var pw = req.body.password;
    if (typeof pw !== "string" || pw !== password) {
        res.status(400).send('missing or incorrect password');
        return;
    }
    var pollName = req.body.name;
    if (typeof pollName !== "string") {
        res.status(400).send('missing or invalid poll name');
        return;
    }
    polls.delete(pollName);
    res.send({ deleted: true });
};
exports.deletePoll = deletePoll;
/** Used in tests to set the polls map back to empty. */
var resetPollsForTesting = function () {
    polls.clear();
};
exports.resetPollsForTesting = resetPollsForTesting;
/** Testing function to move all end times forward the given amount (of ms). */
var advanceTimeForTesting = function (ms) {
    var e_4, _a;
    try {
        for (var _b = __values(polls.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var poll = _c.value;
            poll.endTime -= ms;
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_4) throw e_4.error; }
    }
};
exports.advanceTimeForTesting = advanceTimeForTesting;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JvdXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQXVCQSxxQkFBcUI7QUFDckIsSUFBTSxLQUFLLEdBQXNCLElBQUksR0FBRyxFQUFFLENBQUM7QUFDM0Msc0ZBQXNGO0FBQ3RGLElBQU0sUUFBUSxHQUFXLGVBQWUsQ0FBQztBQUV6Qyx3RkFBd0Y7QUFDeEYsSUFBTSxZQUFZLEdBQUcsVUFBQyxDQUFPLEVBQUUsQ0FBTztJQUNwQyxJQUFNLEdBQUcsR0FBVyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDL0IsSUFBTSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO0lBQzdELElBQU0sSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUM3RCxPQUFPLElBQUksR0FBRyxJQUFJLENBQUM7QUFDckIsQ0FBQyxDQUFDO0FBRUYsbUNBQW1DO0FBQzVCLElBQU0sT0FBTyxHQUFHLFVBQUMsR0FBZ0IsRUFBRSxHQUFpQjs7SUFDekQsSUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDN0IsSUFBSSxPQUFPLEVBQUUsS0FBSyxRQUFRLElBQUksRUFBRSxLQUFLLFFBQVEsRUFBRTtRQUM3QyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQ3RELE9BQU87S0FDUjtJQUVELElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFD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