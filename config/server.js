const express = require('express');

const path = require('path');
const bodyParser =require('body-parser');

const app = express();

app.set(app.set('port'), process.env.PORT || 3000);

