const express = require('express')

const app = express();

const config = require('dotenv').config()
const path = require('path')
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const db = require('./db/queries');

const PORT = process.env.PORT || 5000

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/makeTeams', async (req, res) => {
  const players = await db.getPlayers(req,res);
  res.render('makeTeams', { players });
});

app.post('/addPlayerForm', async (req, res) => {
  console.log('call me');
  const players = await db.createPlayer(req, res);
  res.send({ players });
});

http.listen(PORT, () => console.log(`Listening on ${ PORT }`))


