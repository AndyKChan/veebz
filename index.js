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

app.get('/addPlayer', async (req, res) => {
  res.render('addPlayer');
});

app.get('/getPlayers', async (req, res) => {
  const players = await db.getPlayers(req,res);
  return res.json(players);
});

app.get('/playerList', async (req, res) => {
  const players = await db.getPlayers(req,res);
  res.render('playerList', { players });
});

app.get('/selectPlayers', async (req, res) => {
  const players = await db.getAvailablePlayers(req,res);
  const playersInGame = await db.getPlayersInGame();
  res.render('selectPlayers', { players, playersInGame });
});

app.get('/game', async (req, res) => {
  const players = await db.getPlayersInGame();
  const playersInTeam1 = await db.getPlayersInTeam1(req, res);
  const playersInTeam2 = await db.getPlayersInTeam2(req, res);
  res.render('game', { players, playersInTeam1, playersInTeam2 });
});

app.post('/addPlayerToGame', async (req, res) => {
  await db.addPlayerToGame(req, res);
  res.redirect('/selectPlayers');
});

app.post('/removePlayerFromGame', async (req, res) => {
  await db.removePlayerFromGame(req,res);
  res.redirect('/game');
});

app.post('/removePlayerFromTeam', async (req, res) => {
  await db.removePlayerFromTeam(req,res);
  res.redirect('/game');
});

app.post('/switchPlayerFromTeam', async (req, res) => {
  await db.switchPlayerFromTeam(req,res);
  res.redirect('/game');
})

app.post('/addPlayerForm', async (req, res) => {
  await db.createPlayer(req, res);
  res.redirect('/addPlayer');
});

app.get('/getPlayerById', async (req, res) => {
  const player = await db.getPlayerById(req, res);
  res.status(200).send(player);
});

app.post('/deletePlayerById', async (req, res) => {
  await db.deletePlayer(req, res);
  res.redirect('/selectPlayers');
});

app.post('/randomShuffle', async (req, res) => {
  // console.log(Math.floor(Math.random() * (8 - 1) + 1));
  const players = await db.getPlayersInGame();
  for (let i = players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [players[i], players[j]] = [players[j], players[i]];
  }
  for (let i = 0; i < players.length / 2 - 1; i++) {
    await db.putPlayerInTeam1(players[i].id);
  }
  for (let i = players.length / 2; i < players.length - 1; i++) {
    await db.putPlayerInTeam2(players[i].id);
  }
  res.redirect('/game');
});

http.listen(PORT, () => console.log(`Listening on ${ PORT }`))


