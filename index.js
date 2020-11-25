require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mainRoute = require("./routes/mainRoute");
let app = express();

let pingPage =
  '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>DUT-API</title></head><body><h1>PING</h1></body></html>';

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.get("/ping", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(pingPage);
  res.end();
});

app.use("/api", mainRoute);

app.use((req, res, next) => {
  const error = new Error("Invalid Request");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

const server = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port %s", server.address().port);
});
