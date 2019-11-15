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
  const possibilities = null;
  const skill_difference = null;
  res.render('game', { players, playersInTeam1, playersInTeam2, unassignedPlayers, possibilities, skill_difference });
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

app.get('/unassignPlayersInGame', async (req, res) => {
  res.redirect('/game');
});

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

// app.post('/randomShuffle', async (req, res) => {
//   let players = await db.getPlayersInGame();
//   players = await shuffle(players);
//   for (let i = players.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [players[i], players[j]] = [players[j], players[i]];
//   }
//   let midInd;
//   let end;
//   if (players.length > 12) {
//     midInd = 6;
//     end = 11;
//     console.log('helo');
//   } else {
//     midInd = Math.ceil(players.length / 2);
//     end = players.length - 1;
//   }
//   let count = 0;
//   for (let i = 0; i < end; i++) {
//     if (i < midInd) {
//       await db.putPlayerInTeam1(players[i].id);
//     } else {
//       await db.putPlayerInTeam2(players[i].id);
//     }
//     count++;
//   }
//     console.log(count);
//   res.redirect('/game');
// });

const lockPlayerAlternativePosition = (map, unassignedPlayers, player) => {
  const alternatePositions = player.alternative_positions;
  if (alternatePositions == null) {
    unassignedPlayers.push(player);
    return;
  }
  let isAssigned = false;
  let i = 0;
  while (!isAssigned && i < alternatePositions.length) {
    const alternatePos = alternatePositions[i];
      const alternatePosLockedPlayers = map.get(alternatePos);
      if (alternatePosLockedPlayers == null) {
        player['currPos'] = alternatePos;
        map.set(alternatePos, [player]);
        isAssigned = true;
      } else if (alternatePos == 'setter' && alternatePosLockedPlayers.length < 2) {
        player['currPos'] = alternatePos;
        map.set(alternatePos, [...alternatePosLockedPlayers, player]);
        isAssigned = true;
      } else if (alternatePos == 'middle' && alternatePosLockedPlayers.length < 4) {
        player['currPos'] = alternatePos;
        map.set(alternatePos, [...alternatePosLockedPlayers, player]);
        isAssigned = true;
      } else if (alternatePos == 'power' && alternatePosLockedPlayers.length < 4) {
        player['currPos'] = alternatePos;
        map.set(alternatePos, [...alternatePosLockedPlayers, player]);
        isAssigned = true;
      } else if (alternatePos == 'offside' && alternatePosLockedPlayers.length < 2) {
        player['currPos'] = alternatePos;
        map.set(alternatePos, [...alternatePosLockedPlayers, player]);
        isAssigned = true;
      }
      i++;
  }
  if (!isAssigned) {
    unassignedPlayers.push(player);
  }
};

const lockPlayerPreferredPosition = (map, player) => {
    const preferredPos = player.preferred_position;
    const posLockedPlayers = map.get(preferredPos);
    if (posLockedPlayers == null) {
      player['currPos'] = preferredPos;
      map.set(preferredPos, [player]);
      return true;
    } else if (preferredPos == 'setter' && posLockedPlayers.length < 2) {
      player['currPos'] = preferredPos;
      map.set(preferredPos, [...posLockedPlayers, player]);
      return true;
    } else if (preferredPos == 'middle' && posLockedPlayers.length < 4) {
      player['currPos'] = preferredPos;
      map.set(preferredPos, [...posLockedPlayers, player]);
      return true;
    } else if (preferredPos == 'power' && posLockedPlayers.length < 4) {
      player['currPos'] = preferredPos;
      map.set(preferredPos, [...posLockedPlayers, player]);
      return true;
    } else if (preferredPos == 'offside' && posLockedPlayers.length < 2) {
      player['currPos'] = preferredPos;
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

  const playersInTeam1 = [powers[0], powers[1], setters[0], offsides[0], middles[0], middles[1]];
  const playersInTeam2 = [powers[2], powers[3], setters[1], offsides[1], middles[2], middles[3]];
  const possibilities = null;
  const skill_difference = null;
  res.render('game', { players, playersInTeam1, playersInTeam2, unassignedPlayers, possibilities, skill_difference });
});

app.post('/coedPositionalShuffle', async (req, res) => {
  let players = await db.getPlayersInGame();
  if (players.length < 12) {
    res.redirect('game');
    return;
  }
  players = await shuffle(players);
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
  const playersInTeam1 = [powers[0], powers[3], setters[0], offsides[0], middles[0], middles[3]];
  const playersInTeam2 = [powers[2], powers[1], setters[1], offsides[1], middles[2], middles[1]];
  const possibilities = null;
  const skill_difference = null;
  res.render('game', { players, playersInTeam1, playersInTeam2, unassignedPlayers, possibilities, skill_difference });
});

const assignPlayerPosition = (map, player, positions) => {
  let isAssigned = false;
  let i = 0;
  while (!isAssigned && i < positions.length) {
    const pos = positions[i];
    const assignedPlayersInPos = map.get(pos);
    if (assignedPlayersInPos == null) {
      player['currPos'] = pos;
      map.set(pos, [player]);
      isAssigned = true;
    } else if (pos == 'setter' && assignedPlayersInPos.length < 2) {
      player['currPos'] = pos;
      map.set(pos, [...assignedPlayersInPos, player]);
      isAssigned = true;
    } else if (pos == 'middle' && assignedPlayersInPos.length < 4) {
      player['currPos'] = pos;
      map.set(pos, [...assignedPlayersInPos, player]);
      isAssigned = true;
    } else if (pos == 'power' && assignedPlayersInPos.length < 4) {
      player['currPos'] = pos;
      map.set(pos, [...assignedPlayersInPos, player]);
      isAssigned = true;
    } else if (pos == 'offside' && assignedPlayersInPos.length < 2) {
      player['currPos'] = pos;
      map.set(pos, [...assignedPlayersInPos, player]);
      isAssigned = true;
    }
    i++;
  }
  return isAssigned;
};
const getAllPermutations = async (players, numOfPlayers) => {
  const permutations = new Map();
  let count = 0;
  // for all players get their positions
  for (let i = 0; i < numOfPlayers; i++) {
    const alternativePositions = players[i].alternative_positions || null;
    const positions = alternativePositions != null ? 
       [players[i].preferred_position, ...alternativePositions] : 
       [players[i].preferred_position];
       // for each player's positions assign the player to each one and make all team outcomes
    for (let j = 0; j < positions.length; j++) {
      const map = new Map();
      const unassignedPlayers = [];
      map.set(positions[j], [players[i]]);
      // for each player other than the targetted player, assign them a position they play
      for (let k = 0; k < numOfPlayers; k++) {
        if (players[k] == players[i]) {
          continue;
        }
        // const isAssigned = await assignPlayerPosition(map, players[k], positions);
        // if (!isAssigned) {
        //   continue;
        // }
        // permutations.set(count, map);
        // count++;
        const isLocked = lockPlayerPreferredPosition(map, players[k]);
        if (!isLocked) {
          lockPlayerAlternativePosition(map, unassignedPlayers, players[k]);
        }
        if (unassignedPlayers.length <= 0) {
          permutations.set(count, map);
          count++;
        }
      }
    }
  }
  return permutations;
}

const getPlayerScoreByPosition = async (pid, pos) => {
  try {
    const { 
      blocking, 
      digging, 
      receiving, 
      power_hitting, 
      middle_hitting, 
      offside_hitting,
      tipping,
      serving,
      passing,
      setting
    } = await db.getPlayerSkill(pid);
    let positionalScore;
    if (pos == 'middle') {
      positionalScore = blocking + digging + receiving + middle_hitting + tipping + serving + passing;
    }
    if (pos == 'setter') {
      positionalScore = blocking + digging + receiving + tipping + serving + passing + setting;
    }
    if (pos == 'power') {
      positionalScore = blocking + digging + receiving + power_hitting + tipping + serving + passing; 
    }
    if (pos == 'offside') {
      positionalScore = blocking + digging + receiving + offside_hitting + tipping + serving + passing; 
    }
    return positionalScore;
  } catch (e) {
    console.log('Failed to get score: ', e)
  }
}

app.post('/balanceShuffle', async (req, res) => {
  const players = await db.getPlayersInGame();
  // const players = await db.getPlayers();
  if (players.length < 12) {
    res.redirect('game');
    return;
  }
  const numOfPlayers = players.length >= 12 ? 12 : players.length;
  const permutations = await getAllPermutations(players, numOfPlayers);
  let i;
  let minDifference = 999999999;
  for (i = 0; i < permutations.size; i++) {
    const currPossibility = permutations.get(i);
    const powers = currPossibility.get('power');
    const setters = currPossibility.get('setter');
    const offsides = currPossibility.get('offside');
    const middles = currPossibility.get('middle');
    if (powers.length != 4) {
      permutations.delete(i);
      continue;
    }
    if (setters.length != 2) {
      permutations.delete(i);
      continue;
    }
    if (offsides.length != 2) {
      permutations.delete(i);
      continue;
    }
    if (middles.length != 4) {
      permutations.delete(i);
      continue;
    }
    try {
      const team1Score = powers[0].power_score +
        powers[1].power_score +
        middles[0].middle_score +
        middles[1].middle_score +
        offsides[0].offside_score +
        setters[0].setter_score;

      const team2Score = powers[2].power_score +
        powers[3].power_score +
        middles[2].middle_score +
        middles[3].middle_score +
        offsides[1].offside_score +
        setters[1].setter_score;
      // const team1Score = await db.getPlayerPositionalSkill(powers[0].id, 'power') +
      // await db.getPlayerPositionalSkill(powers[1].id, 'power') +
      // await db.getPlayerPositionalSkill(middles[0].id, 'middle') +
      // await db.getPlayerPositionalSkill(middles[1].id, 'middle') +
      // await db.getPlayerPositionalSkill(offsides[0].id, 'offside') +
      // await db.getPlayerPositionalSkill(setters[0].id, 'setter');

      // const team2Score = await db.getPlayerPositionalSkill(offsides[1].id, 'offside') +
      // await db.getPlayerPositionalSkill(setters[1].id, 'setter') +
      // await db.getPlayerPositionalSkill(powers[2].id, 'power') +
      // await db.getPlayerPositionalSkill(powers[3].id, 'power') +
      // await db.getPlayerPositionalSkill(middles[2].id, 'middle') +
      // await db.getPlayerPositionalSkill(middles[3].id, 'middle');

      const difference = Math.abs(team1Score - team2Score);
      currPossibility.set('difference', difference);
      // if (difference < minDifference) {
      //   //getting the smallest difference for now.. think of how to sort array later
      //   permutations.set(0, currPossibility);
      //   minDifference = difference;
      // }
    } catch (e) {
      console.log('Failed to get team scores: ', e);
    }
  }
  const possibilities = permutations.size;
  const unassignedPlayers = [];
  for (i = 12; i < players.length; i++) {
    unassignedPlayers.push(players[i]);
  }
  const randomNum = Math.floor(Math.random() * Math.floor(possibilities-1));
  console.log(randomNum);
  const map = permutations.get(randomNum);
  const powers = map.get('power');
  const setters = map.get('setter');
  const offsides = map.get('offside');
  const middles = map.get('middle');
  const playersInTeam1 = [powers[0], powers[1], setters[0], offsides[0], middles[0], middles[1]];
  const playersInTeam2 = [powers[2], powers[3], setters[1], offsides[1], middles[2], middles[3]];
  const skill_difference = map.get('difference');
  res.render('game', { players, playersInTeam1, playersInTeam2, unassignedPlayers, possibilities, skill_difference });
});

app.post('/getMostBalancedTeam', async (req, res) => {
  const players = await db.getPlayersInGame();
  // const players = await db.getPlayers();
  if (players.length < 12) {
    res.redirect('game');
    return;
  }
  const numOfPlayers = players.length >= 12 ? 12 : players.length;
  const permutations = await getAllPermutations(players, numOfPlayers);
  let i;
  let minDifference = 999999999;
  for (i = 0; i < permutations.size; i++) {
    const currPossibility = permutations.get(i);
    const powers = currPossibility.get('power');
    const setters = currPossibility.get('setter');
    const offsides = currPossibility.get('offside');
    const middles = currPossibility.get('middle');
    if (powers.length != 4) {
      permutations.delete(i);
      continue;
    }
    if (setters.length != 2) {
      permutations.delete(i);
      continue;
    }
    if (offsides.length != 2) {
      permutations.delete(i);
      continue;
    }
    if (middles.length != 4) {
      permutations.delete(i);
      continue;
    }
    try {
      const team1Score = powers[0].power_score +
        powers[1].power_score +
        middles[0].middle_score +
        middles[1].middle_score +
        offsides[0].offside_score +
        setters[0].setter_score;

      const team2Score = powers[2].power_score +
        powers[3].power_score +
        middles[2].middle_score +
        middles[3].middle_score +
        offsides[1].offside_score +
        setters[1].setter_score;
      // const team1Score = await db.getPlayerPositionalSkill(powers[0].id, 'power') +
      // await db.getPlayerPositionalSkill(powers[1].id, 'power') +
      // await db.getPlayerPositionalSkill(middles[0].id, 'middle') +
      // await db.getPlayerPositionalSkill(middles[1].id, 'middle') +
      // await db.getPlayerPositionalSkill(offsides[0].id, 'offside') +
      // await db.getPlayerPositionalSkill(setters[0].id, 'setter');

      // const team2Score = await db.getPlayerPositionalSkill(offsides[1].id, 'offside') +
      // await db.getPlayerPositionalSkill(setters[1].id, 'setter') +
      // await db.getPlayerPositionalSkill(powers[2].id, 'power') +
      // await db.getPlayerPositionalSkill(powers[3].id, 'power') +
      // await db.getPlayerPositionalSkill(middles[2].id, 'middle') +
      // await db.getPlayerPositionalSkill(middles[3].id, 'middle');

      const difference = Math.abs(team1Score - team2Score);
      currPossibility.set('difference', difference);
      if (difference < minDifference) {
        //getting the smallest difference for now.. think of how to sort array later
        permutations.set(0, currPossibility);
        minDifference = difference;
      }
    } catch (e) {
      console.log('Failed to get team scores: ', e);
    }
  }
  const possibilities = permutations.size;
  const unassignedPlayers = [];
  for (i = 12; i < players.length; i++) {
    unassignedPlayers.push(players[i]);
  }
  let map;
  // for (i = 0; i < 10; i++) {
  //   map = permutations.get(i);
  //   const difference = map.get('difference');
  //   if (difference < minDifference) {
  //     //getting the smallest difference for now.. think of how to sort array later
  //     permutations.set(0, map);
  //     minDifference = difference;
  //   } 
  // }
  map = permutations.get(0);
  const powers = map.get('power');
  const setters = map.get('setter');
  const offsides = map.get('offside');
  const middles = map.get('middle');
  const playersInTeam1 = [powers[0], powers[1], setters[0], offsides[0], middles[0], middles[1]];
  const playersInTeam2 = [powers[2], powers[3], setters[1], offsides[1], middles[2], middles[3]];
  const skill_difference = map.get('difference');
  res.render('game', { players, playersInTeam1, playersInTeam2, unassignedPlayers, possibilities, skill_difference });
});

http.listen(PORT, () => console.log(`Listening on ${ PORT }`))


