const requiresLogin = (req, res, next) => {
  if (!req.session.account) {
    console.log('login');
    // return res.status(400);
  }
  return next();
};

const requiresLogout = (req, res, next) => {
  if (req.session.account) {
    console.log('logout');
    // return res.status(400);
  }
  return next();
};

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
