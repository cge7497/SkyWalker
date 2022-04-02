const models = require('../models');
const DomoModel = require('../models/Domo');

const { Domo } = models;

const makeDomo = async (req, res) => {
  if (!req.body.name || !req.body.age || !req.body.favThing) {
    return res.status(400).json({ error: 'Name, age, and favorite thing are required!' });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    favThing: req.body.favThing,
    owner: req.session.account._id,
  };

  try {
    const newDomo = new Domo(domoData);
    await newDomo.save();
    return res.status(201).json({ name: newDomo.name, age: newDomo.age, favThing: newDomo.favThing});
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists!' });
    }
    return res.status(400).json({ error: 'An error occurred' });
  }
};

const makerPage = (req, res) => res.render('app');

const getDomos = (req, res) => DomoModel.findByOwner(req.session.account._id, (err, docs) => {
  if (err) {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred!' });
  }

  return res.json({ domos: docs });
});

module.exports = {
  makerPage,
  makeDomo,
  getDomos,
};
