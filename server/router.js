const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/init', mid.requiresSecure, controllers.Account.initPage);

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
  app.get('/logout', mid.requiresSecure, mid.requiresLogin, controllers.Account.logout);

  app.post('/addCloud', mid.requiresSecure, mid.requiresLogin, controllers.Game.addCloud);
  app.put('/setShape', mid.requiresSecure, mid.requiresLogin, controllers.Account.setShape);

  app.put('/enterKey', mid.requiresSecure, mid.requiresLogin, controllers.Game.enterKey);

  app.get('/', mid.requiresSecure, controllers.Account.loginPage);
  app.get('/...*', mid.requiresSecure, controllers.Game.returnImage);
  app.get('/*', mid.requiresSecure, controllers.Account.redirect);
};

module.exports = router;
