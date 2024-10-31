import passport from '../../../src/auth/passport';

export default function handler(req, res) {
  passport.authenticate('google', {
    scope: ['profile', 'email', 'openid'],
    accessType: 'offline', // Request offline access to get a refresh token
    prompt: 'consent', // Prompt for consent to get a new refresh token and idToken
  })(req, res);
}
