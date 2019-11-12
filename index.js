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
  const playersInTeam1 = await db.getPlayersInTeam1();
  const playersInTeam2 = await db.getPlayersInTeam2();
  const unassignedPlayers = await db.getUnassignedPlayers();
  res.render('game', { players, playersInTeam1, playersInTeam2, unassignedPlayers });
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

app.post('/unassignPlayerFromTeam', async (req, res) => {
  await db.unassignPlayerFromTeam(req,res);
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

app.post('/putPlayerInTeam1', async (req, res) => {
  await db.putPlayerInTeam1(req.body.id);
  res.redirect('/game');
})

app.post('/putPlayerInTeam2', async (req, res) => {
  await db.putPlayerInTeam2(req.body.id);
  res.redirect('/game');
})

const shuffle = async (players) => {
  for (let i = players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [players[i], players[j]] = [players[j], players[i]];
  }
  return players;
}

app.post('/randomShuffle', async (req, res) => {
  let players = await db.getPlayersInGame();
  players = await shuffle(players);
  for (let i = players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [players[i], players[j]] = [players[j], players[i]];
  }
  const midInd = Math.ceil(players.length / 2);
  for (let i = 0; i < players.length-1; i++) {
    if (i < midInd) {
      await db.putPlayerInTeam1(players[i].id);
    } else {
      await db.putPlayerInTeam2(players[i].id);
    }
  }
  res.redirect('/game');
});

const lockPlayerAlternativePosition = (map, unassignedPlayers, player) => {
  const alternatePositions = player.alternative_positions;
  if (alternatePositions == null) {
    unassignedPlayers.push(player);
    return;
  }
  let hasAlternativePosAndNotAssigned = true;
  let i = 0;
  while (hasAlternativePosAndNotAssigned && i < alternatePositions.length) {
    const alternatePos = alternatePositions[i];
      const alternatePosLockedPlayers = map.get(alternatePos);
      if (alternatePosLockedPlayers == null) {
        map.set(alternatePos, [player]);
        hasAlternativePosAndNotAssigned = false;
      } else if (alternatePos == 'setter' && alternatePosLockedPlayers.length < 2) {
        map.set(alternatePos, [...alternatePosLockedPlayers, player]);
        hasAlternativePosAndNotAssigned = false;
      } else if (alternatePos == 'middle' && alternatePosLockedPlayers.length < 4) {
        map.set(alternatePos, [...alternatePosLockedPlayers, player]);
        hasAlternativePosAndNotAssigned = false;
      } else if (alternatePos == 'power' && alternatePosLockedPlayers.length < 4) {
        map.set(alternatePos, [...alternatePosLockedPlayers, player]);
        hasAlternativePosAndNotAssigned = false;
      } else if (alternatePos == 'offside' && alternatePosLockedPlayers.length < 2) {
        map.set(alternatePos, [...alternatePosLockedPlayers, player]);
        hasAlternativePosAndNotAssigned = false;
      }
      i++;
  }
};

const lockPlayerPreferredPosition = (map, player) => {
    const preferredPos = player.preferred_position;
    const posLockedPlayers = map.get(preferredPos);
    if (posLockedPlayers == null) {
      map.set(preferredPos, [player]);
      return true;
    } else if (preferredPos == 'setter' && posLockedPlayers.length < 2) {
      map.set(preferredPos, [...posLockedPlayers, player]);
      return true;
    } else if (preferredPos == 'middle' && posLockedPlayers.length < 4) {
      map.set(preferredPos, [...posLockedPlayers, player]);
      return true;
    } else if (preferredPos == 'power' && posLockedPlayers.length < 4) {
      map.set(preferredPos, [...posLockedPlayers, player]);
      return true;
    } else if (preferredPos == 'offside' && posLockedPlayers.length < 2) {
      map.set(preferredPos, [...posLockedPlayers, player]);
      return true;
    } else {
      return false;
    }
};

app.post('/preferredPositionalShuffle', async (req, res) => {
  let players = await db.getPlayersInGame();
  if (players.length < 12) {
    res.redirect('game');
    return;
  }
  players = await shuffle(players);
  const map = new Map();
  const unassignedPlayers = [];
  players.forEach(player => {
    const isLocked = lockPlayerPreferredPosition(map, player);
    if (!isLocked) {
      lockPlayerAlternativePosition(map, unassignedPlayers, player);
    }
  });
  const powers = map.get('power');
  const setters = map.get('setter');
  const offsides = map.get('offside');
  const middles = map.get('middle');
  powers[0]['currPos'] = 'power';
  powers[1]['currPos'] = 'power';
  powers[2]['currPos'] = 'power';
  powers[3]['currPos'] = 'power';
  middles[0]['currPos'] = 'middle';
  middles[1]['currPos'] = 'middle';
  middles[2]['currPos'] = 'middle';
  middles[3]['currPos'] = 'middle';
  offsides[0]['currPos'] = 'offside';
  offsides[1]['currPos'] = 'offside';
  setters[0]['currPos'] = 'setter';
  setters[1]['currPos'] = 'setter';
  const playersInTeam1 = [powers[0], powers[1], setters[0], offsides[0], middles[0], middles[1]];
  const playersInTeam2 = [powers[2], powers[3], setters[1], offsides[1], middles[2], middles[3]];
  res.render('game', { players, playersInTeam1, playersInTeam2, unassignedPlayers });
});

app.post('/coedPositionalShuffle', async (req, res) => {
  let players = await db.getPlayersInGame();
  const females = [];
  const males = [];
  players.forEach(player => {
    if (player.gender == 'F') {
      females.push(player);
    } else {
      males.push(player);
    }
  })
  const map = new Map();
  const unassignedPlayers = [];
  females.forEach(female => {
    const isLocked = lockPlayerPreferredPosition(map, female);
    if (!isLocked) {
      lockPlayerAlternativePosition(map, unassignedPlayers, female);
    }
  });
  males.forEach(male => {
    const isLocked = lockPlayerPreferredPosition(map, male);
    if (!isLocked) {
      lockPlayerAlternativePosition(map, unassignedPlayers, male);
    }
  });
  const powers = map.get('power');
  const setters = map.get('setter');
  const offsides = map.get('offside');
  const middles = map.get('middle');
  powers[0]['currPos'] = 'power';
  powers[1]['currPos'] = 'power';
  powers[2]['currPos'] = 'power';
  powers[3]['currPos'] = 'power';
  middles[0]['currPos'] = 'middle';
  middles[1]['currPos'] = 'middle';
  middles[2]['currPos'] = 'middle';
  middles[3]['currPos'] = 'middle';
  offsides[0]['currPos'] = 'offside';
  offsides[1]['currPos'] = 'offside';
  setters[0]['currPos'] = 'setter';
  setters[1]['currPos'] = 'setter';
 
  const playersInTeam1 = [powers[0], powers[3], setters[0], offsides[0], middles[0], middles[3]];
  const playersInTeam2 = [powers[2], powers[1], setters[1], offsides[1], middles[2], middles[1]];
  res.render('game', { players, playersInTeam1, playersInTeam2, unassignedPlayers });
});

app.post('/positionalShuffle', async (req, res) => {
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

app.post('/balanceAndPositionalShuffle', async (req, res) => {
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


