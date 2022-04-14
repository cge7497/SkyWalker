/* Check out webpack.config.js first before reading this file.

   With webpack, we can define multiple configurations to be used
   by different scripts. For example, in the package.json, we have
   a "watch" script and a "heroku-postbuild" script. The watch script
   is the version we will use locally. However, we also want heroku
   to build our webpack bundle right before deploying. We don't, however,
   want Heroku to get stuck in a watch loop where it never actually
   deploys the server because it's waiting for updates to our client code.

   To accomplish this, we can use a second configuration to have webpack
   run without performing the watch operation. https://webpack.js.org/configuration/
*/

const path = require('path');

module.exports = {
    entry: './client/playerLogin.js',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'hosted'),
        filename: 'bundle.js',
    },
};