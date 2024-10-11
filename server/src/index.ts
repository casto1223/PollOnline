import express, { Express } from "express";
import bodyParser from 'body-parser';
import { addPoll, listPolls, getPoll, votePoll, deletePoll } from './routes';


// Configure and start the HTTP server.
const port: number = 8088;
const app: Express = express();
app.use(bodyParser.json());
app.post("/api/add", addPoll);
app.post("/api/delete", deletePoll);
app.get("/api/list", listPolls);
app.get("/api/get", getPoll);
app.post("/api/vote", votePoll);
app.listen(port, () => console.log(`Server listening on ${port}`));
