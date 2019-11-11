const { psql } = require('./psql.js');

const createPlayer = async (req, res) => {
  const { name, positions } = req.body
  const positionsArr = [positions];
  try {
    const insertedPlayer = await psql.query('INSERT INTO players(name, positions) VALUES ($1, $2)', [name, positionsArr]);
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
    const res = await psql.query('UPDATE players SET selected = false WHERE id = $1', [id]); 
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

const getPlayersInGame = async (req, res) => {
  try {
    const { rows } = await psql.query('SELECT * FROM players WHERE selected=true');
    return rows;
  } catch (e) {
    console.log(`Failed to get players in game: ${e}`);
  }
};

module.exports =  {
  addPlayerToGame,
  removePlayerFromGame,
  getPlayersInGame,
  getAvailablePlayers,
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
};
