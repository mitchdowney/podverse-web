const
    feathers = require('feathers'),
    rest = require('feathers-rest'),
    hooks = require('feathers-hooks'),
    bodyParser = require('body-parser'),
    {locator} = require('locator.js'),
    {processJWTIfExists} = require('middleware/auth/processJWTIfExists.js'),
    AuthService = new (require('services/auth/AuthService.js'))(),
    ClipService = new (require('services/clip/ClipService.js'))(),
    {parseFeed, saveParsedFeedToDatabase} = require('tasks/feedParser.js'),
    {nunjucks} = require('nunjucks.js'),
    {routes} = require('routes.js'),
    {errorHandler} = require('middleware/errors.js');

function appFactory () {

  const app = feathers();

  app
    .configure(rest())
    .configure(hooks())
    .configure(nunjucks)
    .configure(errorHandler)

    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))

    .use('/static/node_modules', feathers.static(__dirname + '/../node_modules'))
    .use('/static', feathers.static(__dirname + '/static/libs'))

    .use(processJWTIfExists)

    .use('clips', locator.get('ClipService'))
    .use('playlists', locator.get('PlaylistService'))

    .use('clips/:id', function (req, res) {

      ClipService.get(req.params.id)
        .then(clip => {
          res.locals.currentPage = 'Clip';
          res.render('player.html', clip);
        })
        .catch(e => {
          console.log(e);
          res.sendStatus(404);
        });
    })

    .get('/parse', (req, res) => {
      if (req.body.rssURL) {
        parseFeed(req.body.rssURL)
          .then(parsedFeedObj => {
            saveParsedFeedToDatabase(parsedFeedObj);
          });
      } else {
        throw new errors.GeneralError('An RSS feed URL must be provided.');
      }
    })

    .post('/auth', (req, res) => {
      AuthService.returnJWTInResponseIfValidUsernameAndPassword(req, res);
    })

    .configure(routes);

  return app;
}


module.exports = appFactory;
