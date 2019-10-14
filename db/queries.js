const { psql } = require('./psql.js');

const createPlayer = (req, res) => {
  const { name, positions} = req.body
  psql.connect();
  psql.query('INSERT INTO players(name, positions) VALUES ($1, $2)', [name, positions], (error, results) => {
    if (error) {
      throw error
    }
    res.status(201).send(`Player added with ID: ${result.insertId}`)
  })
  psql.end();
}

const getPlayers = async (req, res) => {
  try {
    const { rows } = await psql.query('SELECT * FROM players');
    return JSON.stringify(rows);
  } catch (e) {
    console.log(`Failed to get players: ${e}`);
  }
};

const getPlayerById = (req, res) => {
  const id = parseInt(req.params.id)
  psql.query('SELECT * FROM players WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows)
  })
}

const updatePlayer = (req, res) => {
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

const deletePlayer = (req, res) => {
  const id = parseInt(req.params.id)
  psql.query('DELETE FROM players WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).send(`Player deleted with ID: ${id}`)
  })
}

module.exports =  {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
};