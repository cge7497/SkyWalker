const models = require('../models');
const PlayerModel = require('../models/Player');

const { Player } = models;

const makePlayer = async (req, res) => {
  if (!req.body.name || !req.body.color) {
    return res.status(400).json({ error: 'Name and color are required!' });
  }

  const playerData = {
    name: req.body.name,
    color: req.body.color,
    items: req.body.items, // what syntax can I use for this conditional? Maybe ternary operator
    owner: req.session.account._id,
  };

  try {
    const newPlayer = new Player(playerData);
    await newPlayer.save();
    return res.status(201).json({
      name: newPlayer.name,
      color: newPlayer.color,
      items: newPlayer.items,
    });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Player already exists!' });
    }
    return res.status(400).json({ error: 'An error occurred' });
  }
};

const appPage = (req, res) => res.render('app');

const getPlayers = (req, res) => PlayerModel.findByOwner(req.session.account._id, (err, docs) => {
  if (err) {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred!' });
  }

  return res.json({ domos: docs });
});

module.exports = {
  appPage,
  makePlayer,
  getPlayers,
};
