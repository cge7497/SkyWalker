const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);

  app.route('/getLevel')
    .get(mid.requiresSecure, controllers.Game.getLevel)
    .head(mid.requiresSecure, controllers.Game.getLevelMeta);

  app.route('/getPlayers')
    .get(mid.requiresSecure, controllers.Game.getPlayers)
    .head(mid.requiresSecure, controllers.Game.getPlayersMeta);

  app.route('/getPlayer')
    .get(mid.requiresSecure, controllers.Game.getPlayer)
    .head(mid.requiresSecure, controllers.Game.getPlayerMeta);

  app.post('/updateItems', mid.requiresSecure, mid.requiresLogin, controllers.Account.updateItems);
  app.post('/changePassword', mid.requiresSecure, mid.requiresLogin, controllers.Account.changePassword);

  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/initGame', mid.requiresSecure, mid.requiresLogin, controllers.Account.initGame)
  app.post('/addCloud', mid.requiresSecure, mid.requiresLogin, controllers.Game.addCloud);

  app.get('/', mid.requiresSecure, controllers.Account.loginPage);
  app.get('/*', mid.requiresSecure, controllers.Account.redirect);
};

module.exports = router;
