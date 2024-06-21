const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());




const { getFlightsByUser } = require("./controllers/flights.controllers.js");


app.get("/api/flights/:user_id", getFlightsByUser);


const apiRouter = require("./routes");
// router
app.use("/api", apiRouter);

//handle custom errors
app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

//handle Database errors
app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "server error getting API" });
});

module.exports = { app };
