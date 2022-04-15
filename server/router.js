const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  // app.get('/getDomos', mid.requiresLogin, controllers.Player.getPlayers);

  app.route('/getLevel')
    .get(mid.requiresSecure, controllers.Game.getLevel)
    .head(mid.requiresSecure, controllers.Game.getLevelMeta);

  app.route('/getPlayers')
    .get(mid.requiresSecure, controllers.Game.getPlayers)
    .head(mid.requiresSecure, controllers.Game.getPlayersMeta);

  app.route('/getPlayer')
    .get(mid.requiresSecure, controllers.Game.getPlayer)
    .head(mid.requiresSecure, controllers.Game.getPlayerMeta);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
