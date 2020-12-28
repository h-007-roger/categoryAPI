require('./config/config');
const { getUserData } = require('./db/sql-coonection');

const _ = require('lodash');
var cors = require('cors');
const fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
const routes = require('./routes');

const app = express()
const port = process.env.PORT

// Load envs from .env file
if (fs.existsSync('./.env')) {
	require('dotenv').config();
}
// to resolve cors error
app.use(cors())

//Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use(bodyParser.json())

// Load routes
routes(app);

app.listen(port, () => {
  console.log(`App listining at http://localhost:${port}`)
})

exports.default = {app}