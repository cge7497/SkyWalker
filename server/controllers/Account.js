const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('app', { csrfToken: req.csrfToken() });

const getToken = (req, res) => res.json({ csrfToken: req.csrfToken() });

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password' });
    }
    req.session.account = Account.toAPI(account);

    return res.json({
      username: req.session.account.username,
      items: req.session.account.items,
      color: req.session.account.color,
    });
  });
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;
  const color = `${req.body.color}`;

  if (!username || !pass || !pass2 || !color) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash, color });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({
      username: req.session.account.username,
      items: req.session.account.items,
      color: req.session.account.color,
    });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use.' });
    }
    return res.status(400).json({ error: 'An error occurred' });
  }
};

const updateItems = async (req, res) => {
  const name = `${req.body.username}`;
  const item = `${req.body.item}`;

  if (!name || !item) {
    return res.status(400).json({ error: 'Username and valid item ID are required!' });
  }

  try {
    const doc = await Account.findOne({ username: req.session.account.username }).exec();

    if (!doc) return res.json({ error: 'Account with that username not found.' });

    const key = `items.${item}`;
    // I was having trouble using the typical method of something like doc.items[item] = true.
    // It's likely because I'm setting an object property.
    // I found this solution here, and the [var] syntax for the set command: https://stackoverflow.com/a/23833060
    doc.set({ [key]: true });

    await doc.save(); // doc.save isn't working. Try one of the more official methods?

    console.log(doc);

    return res.status(204);
  } catch (e) {
    return res.status(400).json({ error: 'An error occurred' });
  }
};

const changePassword = async (req, res) => {
  const username = `${req.session.account.username}`;
  const oldPass = `${req.body.oldPass}`;
  const newPass = `${req.body.newPass}`;

  if (!username || !oldPass || !newPass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  // Authenticate the account.
  await Account.authenticate(username, oldPass, async (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password' });
    }
    // If successful, hash the password and then set it as the account's password.
    try {
      const hash = await Account.generateHash(newPass);
      account.password = hash;
      await account.save();
      return res.status(200).json({message: 'Successfully changed password for user ' + username});
    }
    catch (e) {
      return res.status(400).json({ error: 'An error occured.' });
    }
  });
};

module.exports = {
  loginPage,
  login,
  logout,
  signup,
  updateItems,
  changePassword,
  getToken,
};
