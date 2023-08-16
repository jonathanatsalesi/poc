const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { join } = require("path");

const { api } = require('./web-routes')

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.static(join(__dirname, "dist")));
app.use(express.json());
app.use('/api', api)

if (process.env.NODE_ENV === "production") {
  app.use((_, res) => {
    res.sendFile(join(__dirname, "dist", "index.html"));
  });
}
const port = process.env.NODE_ENV === "production" ? 3000 : 3001;
app.listen(port, () => console.log(`Server listening on port ${port}`));