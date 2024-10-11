import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { resetPollsForTesting, advanceTimeForTesting, addPoll, listPolls, getPoll, votePoll, deletePoll } from './routes';

describe('routes', function() {

  it ('addPoll', function() {
    // missing password
    const req0 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {}});
    const res0 = httpMocks.createResponse();
    addPoll(req0, res0);

    assert.strictEqual(res0._getStatusCode(), 400);
    assert.deepStrictEqual(res0._getData(),
      'missing or incorrect password');

    // missing password
    const req01 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "asas"}});
    const res01 = httpMocks.createResponse();
    addPoll(req01, res01);

    assert.strictEqual(res01._getStatusCode(), 400);
    assert.deepStrictEqual(res01._getData(),
      'missing or incorrect password');
    
    // missing name
    const req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", endTime: 112}});
    const res1 = httpMocks.createResponse();
    addPoll(req1, res1);

    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(),
      'required argument "name" was missing or faulty');

    // missing endTime
    const req2 = httpMocks.createRequest(
    {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "A"}});
    const res2 = httpMocks.createResponse();
    addPoll(req2, res2);

    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(),
      'required argument "endTime" was missing or faulty');
    
    resetPollsForTesting();
    
    // missing options
    const req3 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "A", endTime: 12}});
      const res3 = httpMocks.createResponse();
      addPoll(req3, res3);
  
      assert.strictEqual(res3._getStatusCode(), 400);
      assert.deepStrictEqual(res3._getData(),
        'required argument "options" was missing or faulty');
      
    resetPollsForTesting();

    // faulty elements in options
    const req4 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "A", endTime: 12, options: ["A1", "A2", 3]}});
      const res4 = httpMocks.createResponse();
      addPoll(req4, res4);
  
      assert.strictEqual(res4._getStatusCode(), 400);
      assert.deepStrictEqual(res4._getData(),
        'required argument "elements in options" was missing or faulty');
    
    // faulty options
    const req41 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "A", endTime: 12, options: "N"}});
      const res41 = httpMocks.createResponse();
      addPoll(req41, res41);

       assert.strictEqual(res41._getStatusCode(), 400);
       assert.deepStrictEqual(res41._getData(),
        'required argument "options" was missing or faulty');
    
    resetPollsForTesting();

    // missing or faulty optionVotes
    const req5 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "A", endTime: 12, options: ["A1", "A2"], optionVotes: "A"}});
      const res5 = httpMocks.createResponse();
      addPoll(req5, res5);
    
       assert.strictEqual(res5._getStatusCode(), 400);
       assert.deepStrictEqual(res5._getData(),
        'required argument "optionVotes" was missing or faulty');
    
    // missing or faulty elements in optionVotes
    const req51 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "A", endTime: 12, options: ["A1", "A2"], optionVotes: ["a", "b", 12]}});
      const res51 = httpMocks.createResponse();
      addPoll(req51, res51);
        
        assert.strictEqual(res51._getStatusCode(), 400);
        assert.deepStrictEqual(res51._getData(),
         'required argument "elements in optionVotes" was missing or faulty');

    // missing or faulty voterNames
    const req9 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "A", endTime: 12, options: ["A1", "A2"], optionVotes: [1, 0]}});
      const res9 = httpMocks.createResponse();
      addPoll(req9, res9);
    
       assert.strictEqual(res9._getStatusCode(), 400);
       assert.deepStrictEqual(res9._getData(),
        'required argument "voterNames" was missing or faulty');
    
    // missing or faulty elements in voterNames
    const req91 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "A", endTime: 12, options: ["A1", "A2"], optionVotes: [1, 0], voterNames: ["A"], voterVotes: [], totalVotes: 2}});
      const res91 = httpMocks.createResponse();
      addPoll(req91, res91);
        
        assert.strictEqual(res91._getStatusCode(), 400);
        assert.deepStrictEqual(res91._getData(),
         'required argument "elements in voterNames" was missing or faulty');
    
    resetPollsForTesting();

    // missing or faulty voterNames
    const req10 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "A", endTime: 12, options: ["A1", "A2"], optionVotes: [1, 0], voterNames: [], totalVotes: 2}});
      const res10 = httpMocks.createResponse();
      addPoll(req10, res10);
    
       assert.strictEqual(res10._getStatusCode(), 400);
       assert.deepStrictEqual(res10._getData(),
        'required argument "voterVotes" was missing or faulty');
    
    // missing or faulty elements in voterNames
    const req11 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "A", endTime: 12, options: ["A1", "A2"], optionVotes: [1, 0], voterNames: [], voterVotes: [3], totalVotes: 2}});
      const res11 = httpMocks.createResponse();
      addPoll(req11, res11);
        
        assert.strictEqual(res11._getStatusCode(), 400);
        assert.deepStrictEqual(res11._getData(),
         'required argument "elements in voterVotes" was missing or faulty');
    
    resetPollsForTesting();

    // missing or faulty totalVotes
    const req6 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "A", endTime: 12, options: ["A1", "A2"], optionVotes: [1, 3, 2], voterNames: [], voterVotes: [], totalVotes: "M"}});
      const res6 = httpMocks.createResponse();
      addPoll(req6, res6);
    
      assert.strictEqual(res6._getStatusCode(), 400);
      assert.deepStrictEqual(res6._getData(),
        'required argument "totalVotes" was missing or faulty');
    
    // poll with same name already exists
    const req7 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "A", endTime: 12, options: ["A1", "A2"], optionVotes: [1, 3, 2], voterNames: [], voterVotes: [], totalVotes: 6}});
      const res7 = httpMocks.createResponse();
      addPoll(req7, res7);
    
    const req71 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "A", endTime: 13, options: ["B1", "A2"], optionVotes: [1, 3, 2], voterNames: [], voterVotes: [], totalVotes: 6}});
      const res71 = httpMocks.createResponse();
      addPoll(req71, res71);
    
      assert.strictEqual(res71._getStatusCode(), 400);
      assert.deepStrictEqual(res71._getData(),
        "poll for 'A' already exists");
    
    resetPollsForTesting();

    // returns a poll (successful add)
    const req8 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "A", endTime: 12, options: ["A1", "A2"], optionVotes: [1, 3, 2], voterNames: [], voterVotes: [], totalVotes: 6}});
      const res8 = httpMocks.createResponse();
      addPoll(req8, res8);
    
      assert.strictEqual(res8._getStatusCode(), 200);

    resetPollsForTesting();
  });


  it('list', function() {
    //empty map and empty input
    const req1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/list', query: {}});
    const res1 = httpMocks.createResponse();
    listPolls(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getData(), {pollsList: []});

    //adding polls
    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "A", endTime: 1, options: ["A1"], optionVotes: [1], totalVotes: 1, voterNames: [], voterVotes: []}});
      const res2 = httpMocks.createResponse();
      addPoll(req2, res2);
    const req3 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "B", endTime: 2, options: ["B1"], optionVotes: [2], totalVotes: 2, voterNames: [], voterVotes: []}});
      const res3 = httpMocks.createResponse();
      addPoll(req3, res3);
    const req5 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "C", endTime: 4, options: ["C1"], optionVotes: [1], totalVotes: 1, voterNames: [], voterVotes: []}});
      const res5 = httpMocks.createResponse();
      addPoll(req5, res5);
  
    // check /list returns correct array of Polls in expecte order
    const req4 = httpMocks.createRequest(
        {method: 'GET', url: '/api/list', query: {}});
    const res4 = httpMocks.createResponse();
    listPolls(req4, res4);
    assert.strictEqual(res4._getStatusCode(), 200);
    assert.deepStrictEqual(res4._getData().pollsList[0].name, "A");
    assert.deepStrictEqual(res4._getData().pollsList[1].name, "B");

  });


  it('getPoll', function() {
    // missing name
    const req2 = httpMocks.createRequest(
      {method: 'GET', url: '/api/get', query: {name: undefined}});
      const res2 = httpMocks.createResponse();
      getPoll(req2, res2);
      assert.strictEqual(res2._getStatusCode(), 400);
      assert.deepStrictEqual(res2._getData(), 'did not provide a valid name');

    // no poll of the given name exists
    const req1 = httpMocks.createRequest(
      {method: 'GET', url: '/api/get', query: {name: "D"}});
      const res1 = httpMocks.createResponse();
      getPoll(req1, res1);
      assert.strictEqual(res1._getStatusCode(), 404);
      assert.deepStrictEqual(res1._getData(), 'no poll of the given name exists');

    // normal case
    const req3 = httpMocks.createRequest(
      {method: 'GET', url: '/api/get', query: {name: "A"}});
      const res3 = httpMocks.createResponse();
      getPoll(req3, res3);
      assert.strictEqual(res3._getStatusCode(), 200);
      assert.deepStrictEqual(res3._getData().poll.name, "A");
      assert.deepStrictEqual(res3._getData().poll.totalVotes, 1);
      
  });

  it('votePoll', function() {

    // invalid poll name 
    const req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: undefined}});
      const res1 = httpMocks.createResponse();
      votePoll(req1, res1);
      assert.strictEqual(res1._getStatusCode(), 400);
      assert.deepStrictEqual(res1._getData(), 'missing or invalid poll name');

    // missing poll name 
    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {}});
      const res2 = httpMocks.createResponse();
      votePoll(req2, res2);
      assert.strictEqual(res2._getStatusCode(), 400);
      assert.deepStrictEqual(res2._getData(), 'missing or invalid poll name');

    // no poll with given name
    const req3 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: "D"}});
      const res3 = httpMocks.createResponse();
      votePoll(req3, res3);
      assert.strictEqual(res3._getStatusCode(), 400);
      assert.deepStrictEqual(res3._getData(), "no poll with name 'D'");

    // missing voter name
    const req5 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: "A"}});
      const res5 = httpMocks.createResponse();
      votePoll(req5, res5);
      assert.strictEqual(res5._getStatusCode(), 400);
      assert.deepStrictEqual(res5._getData(), 'missing or invalid voter name');

    // invalid voter name
    const req6 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: "A", voter: 12}});
      const res6 = httpMocks.createResponse();
      votePoll(req6, res6);
      assert.strictEqual(res6._getStatusCode(), 400);
      assert.deepStrictEqual(res6._getData(), 'missing or invalid voter name');
    
    // missing voter choice 
    const req7 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: "A", voter: "aa"}});
      const res7 = httpMocks.createResponse();
      votePoll(req7, res7);
      assert.strictEqual(res7._getStatusCode(), 400);
      assert.deepStrictEqual(res7._getData(), 'missing or invalid voter vote');

    // invalid voter choice 
    const req8 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: "A", voter: "aa", choice: 1}});
      const res8 = httpMocks.createResponse();
      votePoll(req8, res8);
      assert.strictEqual(res8._getStatusCode(), 400);
      assert.deepStrictEqual(res8._getData(), 'missing or invalid voter vote');

    // invalid voter choice 
    const req9 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: "A", voter: "aa", choice: "a"}});
      const res9 = httpMocks.createResponse();
      votePoll(req9, res9);
      assert.strictEqual(res9._getStatusCode(), 400);
      assert.deepStrictEqual(res9._getData(), 'missing or invalid voter vote');

    // normal case in a non-new poll
    const req101 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "A2", endTime: 1, options: ["A1", "A2"], optionVotes: [1, 1], totalVotes: 2, voterNames: [], voterVotes: []}});
      const res101 = httpMocks.createResponse();
      addPoll(req101, res101);

    const req10 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: "A2", voter: "aa", choice: 0}});
      const res10 = httpMocks.createResponse();
      votePoll(req10, res10);
      assert.strictEqual(res10._getStatusCode(), 200);
      assert.deepStrictEqual(res10._getData().poll.name, "A2");
      assert.deepStrictEqual(res10._getData().poll.voterNames[0], "aa");
      assert.deepStrictEqual(res10._getData().poll.voterVotes[0], 0);
      assert.deepStrictEqual(res10._getData().poll.optionVotes[0], 2);
      assert.deepStrictEqual(res10._getData().poll.totalVotes, 3);

    // normal case in a new poll 
    const req102 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {password: "Cassandra1123", name: "A3", endTime: 1, options: ["A1", "A2", "A3"], optionVotes: [0, 0, 0], totalVotes: 0, voterNames: [], voterVotes: []}});
      const res102 = httpMocks.createResponse();
      addPoll(req102, res102);

    const req11 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: "A3", voter: "aa", choice: 2}});
      const res11 = httpMocks.createResponse();
      votePoll(req11, res11);
      assert.strictEqual(res11._getStatusCode(), 200);
      assert.deepStrictEqual(res11._getData().poll.name, "A3");
      assert.deepStrictEqual(res11._getData().poll.voterNames[0], "aa");
      assert.deepStrictEqual(res11._getData().poll.voterVotes[0], 2);
      assert.deepStrictEqual(res11._getData().poll.optionVotes[2], 1);
      assert.deepStrictEqual(res11._getData().poll.totalVotes, 1);

    // poll ended
    advanceTimeForTesting(5 * 60 * 1000 + 50);
    const req4 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: "A"}});
      const res4 = httpMocks.createResponse();
      votePoll(req4, res4);
      assert.strictEqual(res4._getStatusCode(), 400);
      assert.deepStrictEqual(res4._getData(), 'poll has already ended');

  });

  it('deletePoll', function() {
    // invalid password 
    const req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/delete', body: {password: "wefw"}});
      const res1 = httpMocks.createResponse();
      deletePoll(req1, res1);
      assert.strictEqual(res1._getStatusCode(), 400);
      assert.deepStrictEqual(res1._getData(), 'missing or incorrect password');

    // missing password 
    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/delete', body: {}});
      const res2 = httpMocks.createResponse();
      deletePoll(req2, res2);
      assert.strictEqual(res2._getStatusCode(), 400);
      assert.deepStrictEqual(res2._getData(), 'missing or incorrect password');

    // missing poll name 
    const req3 = httpMocks.createRequest(
      {method: 'POST', url: '/api/delete', body: {password: "Cassandra1123"}});
      const res3 = httpMocks.createResponse();
      deletePoll(req3, res3);
      assert.strictEqual(res3._getStatusCode(), 400);
      assert.deepStrictEqual(res3._getData(), 'missing or invalid poll name');

    // invalid poll name 
    const req4 = httpMocks.createRequest(
      {method: 'POST', url: '/api/delete', body: {password: "Cassandra1123", name: 123}});
      const res4 = httpMocks.createResponse();
      deletePoll(req4, res4);
      assert.strictEqual(res4._getStatusCode(), 400);
      assert.deepStrictEqual(res4._getData(), 'missing or invalid poll name');

    // normal case
    const req5 = httpMocks.createRequest(
      {method: 'POST', url: '/api/delete', body: {password: "Cassandra1123", name: "A3"}});
      const res5 = httpMocks.createResponse();
      deletePoll(req5, res5);
      assert.strictEqual(res5._getStatusCode(), 200);
      assert.deepStrictEqual(res5._getData(), {deleted:true});
  });

});


