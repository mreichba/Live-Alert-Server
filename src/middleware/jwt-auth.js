const AuthService = require('../auth/auth-services');

function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';

  let bearerToken;
  if (!authToken.toLowerCase().startsWith('bearer ')) {//verify auth token
    return res.status(401).json({ error: 'Missing bearer token' });
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }
  try {
    const payload = AuthService.verifyJwt(bearerToken);//compares token to jwt secret in .env
    //gets user from user database with email
    AuthService.getUserWithEmail(
      req.app.get('db'),
      payload.sub
    )
      .then(user => {//verifies user
        if (!user)
          return res.status(401).json({ error: 'Unauthorized request' });

        req.user = user;
        next();
      })
      .catch(err => {
        next(err);
      });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized request' });
  }
}

module.exports = requireAuth;