const { psql } = require('./psql.js');

const createPlayer = async (req, res) => {
  const { fname, lname, preferredPosition, power, middle, offside, setter, gender } = req.body
  if (fname == null) {
    return false;
  }
  if (preferredPosition == null) {
    return false;
  }
  const alternatePositions = [];
  if (power == "power" && preferredPosition != "power") {
    alternatePositions.push("power");
  }
  if (middle == "middle" && preferredPosition != "middle") {
    alternatePositions.push("middle");
  }
  if (offside == "offside" && preferredPosition != "offside") {
    alternatePositions.push("offside");
  }
  if (setter == "setter" && preferredPosition != "setter") {
    alternatePositions.push("setter");
  }
  try {
    const insertedPlayer = await psql.query('INSERT INTO players(preferred_position, fname, lname, alternative_positions, gender) VALUES ($1, $2, $3, $4, $5)', [preferredPosition, fname, lname, alternatePositions, gender]);
    return insertedPlayer;
  } catch (e) {
    console.log(`Failed to add player: ${e}`);
  }
}

const getPlayers = async (req, res) => {
  try {
    const { rows } = await psql.query('SELECT * FROM players');
    return rows;
  } catch (e) {
    console.log(`Failed to get players: ${e}`);
  }
};

const updatePlayer = async (req, res) => {
  const id = parseInt(req.params.id)
  const { name, positions  } = req.body
  psql.query(
    'UPDATE players SET name = $1, positions = $2 WHERE id = $3',
    [name, positions, id],
    (error, results) => {
      if (error) {
        throw error
      }
      res.status(200).send(`Player modified with ID: ${id}`)
    }
  )
}

const deletePlayer = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    const res = await psql.query('DELETE FROM players WHERE id = $1', [id]); 
    return res;
  } catch (e) {
    console.log(e);
  }
};

const getPlayerById = async (req, res) => {
  try {
    const { id } = req.query;
    const { rows } = await psql.query('SELECT * FROM players where id = $1', [id]);
    return rows;
  } catch (e) {
    console.log(e);
  }
};

const addPlayerToGame = async (req, res) => {
  const { id } = req.body
  try {
    const insertedPlayer = await psql.query('UPDATE players SET selected = true WHERE id = $1', [id]);
    return insertedPlayer;
  } catch (e) {
    console.log(`Failed to add players in game: ${e}`);
  }
};

const removePlayerFromGame = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    const res = await psql.query('UPDATE players SET selected = false, team = 0 WHERE id = $1', [id]); 
    return res;
  } catch (e) {
    console.log(e);
  }
};

const removePlayerFromTeam = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    const res = await psql.query('UPDATE players SET team = 0 WHERE id = $1', [id]); 
    return res;
  } catch (e) {
    console.log(e);
  }
};

const getAvailablePlayers = async (req, res) => {
  try {
    const { rows } = await psql.query('SELECT * FROM players WHERE selected=false');
    return rows;
  } catch (e) {
    console.log(`Failed to get players in game: ${e}`);
  }
};

const getPlayersInGame = async () => {
  try {
    const { rows } = await psql.query('SELECT * FROM players WHERE selected=true');
    return rows;
  } catch (e) {
    console.log(`Failed to get players in game: ${e}`);
  }
};

const putPlayerInTeam1 = async (id) => {
  try {
    const res = await psql.query('UPDATE players SET team = 1 WHERE id = $1', [id]); 
    return res;
  } catch (e) {
    console.log(`Failed to add player to team 1: ${e}`);
  }
};

const putPlayerInTeam2 = async (id) => {
  try {
    const res = await psql.query('UPDATE players SET team = 2 WHERE id = $1', [id]); 
    return res;
  } catch (e) {
    console.log(`Failed to add player to team 2: ${e}`);
  }
};

const switchPlayerFromTeam = async (req) => {
  try {
    const { id, team } = req.body;
    let res;
    if (team == 1) {
      res = await psql.query('UPDATE players SET team = 2 WHERE id = $1', [id]); 
    } else {
      res = await psql.query('UPDATE players SET team = 1 WHERE id = $1', [id]); 
    }
    return res;
  } catch (e) {
    console.log(`Failed to switch teams: ${e}`);
  }
};

const getPlayersInTeam1 = async () => {
  try {
    const { rows } = await psql.query('SELECT * FROM players WHERE team=1');
    return rows;
  } catch (e) {
    console.log(`Failed to get players in game: ${e}`);
  }
};

const getPlayersInTeam2 = async () => {
  try {
    const { rows } = await psql.query('SELECT * FROM players WHERE team=2');
    return rows;
  } catch (e) {
    console.log(`Failed to get players in game: ${e}`);
  }
};

const getUnassignedPlayers = async () => {
  try {
    const { rows } = await psql.query('SELECT * FROM players WHERE team=0 AND selected=true');
    return rows;
  } catch (e) {
    console.log(`Failed to get players in game: ${e}`);
  }
};

const unassignPlayerFromTeam = async (req) => {
  try {
    const { id } = req.body;
    const res = await psql.query('UPDATE players SET team = 0 WHERE id = $1', [id]); 
    return res;
  } catch (e) {
    console.log(`Failed to unassign team: ${e}`);
  }
};

const getPlayerSkill = async (pid) => {
  try {
    const res = await psql.query('SELECT * FROM player_skill WHERE pid = $1', [pid]);
    return res;
  } catch (e) {
    console.log(`Failed to get player position score: ${e}`);
  }
};

module.exports =  {
  getPlayerSkill,
  addPlayerToGame,
  removePlayerFromGame,
  getPlayersInGame,
  getAvailablePlayers,
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getPlayersInTeam1,
  getPlayersInTeam2,
  removePlayerFromTeam,
  putPlayerInTeam1,
  putPlayerInTeam2,
  switchPlayerFromTeam,
  getUnassignedPlayers,
  unassignPlayerFromTeam
};
