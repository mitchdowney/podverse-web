"use strict";

let
  clipRepository = new (require('./ClipRepository.js'))(),
  playlistServiceFactory = require('./playlistServiceFactory.js'),
  config = require('./config.js'),
  requireAPISecret = require('./requireAPISecretMiddleware.js');



module.exports = app => {

  app.get('/', function(req, res) {

    clipRepository.getHomeScreenClips()
      .then(clips => {
        res.locals.currentPage = 'Home';
        res.render('home.html', {clips});
      })
      .catch(e => {
        console.error(e);
        res.sendStatus(500);
      });
  });

  app.get('/mobile-app', function(req, res) {
    res.locals.currentPage = 'Mobile App';
    res.render('mobile-app.html');
  });

  app.get('/about', function(req, res) {
    res.locals.currentPage = 'About';
    res.render('about.html');
  });

  // View a clip
  app.get('/c/:id', (req, res) => {

    clipRepository.getClip(req.params.id)
      .then(clip => {
        res.locals.currentPage = 'Clip';
        res.render('player.html', clip);
      })
      .catch(e => {
        console.error(e);
        res.sendStatus(404);
      });
  });

  app.get('/c', (req, res) => {
    let userId = req.query.userId;

    if(!userId) {
      res.sendStatus(400);
      return;
    }

    clipRepository.getClipsByUserId(userId)
      .then(clips => {
        res.send(clips);
      });

  });

  // Create a clip
  app.post('/c', requireAPISecret, (req, res) => {

    let clip = req.body;

    clipRepository.createClip(clip)
      .then(clipId => {
        // Send the URI of the clip back somehow
        let result = {
          clipUri: `${config.baseURL}/c/${clipId}`
        };

        res.status(201).send(result);
      })
      .catch(e => {
        res.status(500).send(e);
      });
  });


  app.get('/playlist/:id', (req, res) => {
    let svc = playlistServiceFactory();
    res.locals.currentPage = 'Playlist';
    svc.get(req.params.id)
      .then(playlist => res.render('player.html', playlist))
      .catch(()=> {
        res.sendStatus(404);
      });
  });

  //
  //// Playlists
  ///
  app.use('/pl', require('./requireAPISecretMiddleware.js'));
  app.use('/pl', playlistServiceFactory());


};
