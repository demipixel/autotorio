const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');


const PORT = process.env.NODE_ENV != 'production' ? 5000 : 80;

const app = express();

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cookieParser());

const server = app.listen(PORT, () => {
  console.log('Server live on port ' + server.address().port);
});

require('./router')(app);
