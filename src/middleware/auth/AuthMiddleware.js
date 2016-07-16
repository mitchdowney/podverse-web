const
    nJwt = require('njwt'),
    Cookies = require('Cookies'),
    config = require('config.js');

function checkIfAuthenticatedUser (req, res, next) {

  // Auth tokens only need to be checked when we're updating an existing item
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    next();
    return;
  }

  const token = retrieveMobileOrWebTokenFromRequest(req, res);

  if (token === undefined) {
    res.sendStatus(401);
    return;
  }

  try {
    const verifiedJwt = nJwt.verify(token, config.apiSecret);
    if (verifiedJwt === 'error: not authorized') {
      res.sendStatus(401);
    } else {
      req.feathers.token = token;
      req.feathers.user = verifiedJwt.body.sub;
      next();
    }
  } catch(e) {
    res.sendStatus(401);
  }

}

function retrieveMobileOrWebTokenFromRequest(req, res) {
  let token;

  if (req.headers['user-agent'] == 'Mobile App') {
    token = req.headers['x-auth-token'];
  } else {
    token = new Cookies(req, res).get('access_token');
  }

  return token;
}

module.exports = {
  checkIfAuthenticatedUser
};