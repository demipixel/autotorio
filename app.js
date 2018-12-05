const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const http = require('http');
const https = require('https');
const fs = require('fs');


const PORT = process.env.NODE_ENV != 'production' ? 5000 : 443;

const app = express();

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/favicon.ico', express.static('assets/img/favicon.ico'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cookieParser());

const certPath = '/etc/letsencrypt/live/autotorio.com/fullchain.pem';
const keyPath = '/etc/letsencrypt/live/autotorio.com/privkey.pem';

const server = (process.env.NODE_ENV == 'production' ? https.createServer({
  cert: fs.existsSync(certPath) ? fs.readFileSync(certPath) : undefined,
  key: fs.existsSync(keyPath) ? fs.readFileSync(keyPath) : undefined
}) : http.createServer(app)).listen(PORT, () => {
  console.log('Server live on port ' + PORT);
});

require('./router')(app);
