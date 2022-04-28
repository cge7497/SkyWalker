const requiresLogin = (req, res, next) => {
  if (!req.session.account) {
    //return res.redirect('/');
  }
  return next();
};

const requiresLogout = (req, res, next) => {
  if (req.session.account) {
    return res.status(401).json({ error: 'You must be logged out to complete that action.' });
  }
  return next();
};

// Player goes to homepage logged in: it should automatically start game!
// Player tries to change password while not logged in.
const requiresSecure = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  return next();
};

const bypassSecure = (req, res, next) => {
  next();
};

module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;

if (process.env.NODE_ENV === 'production') {
  module.exports.requiresSecure = requiresSecure;
} else {
  module.exports.requiresSecure = bypassSecure;
}
