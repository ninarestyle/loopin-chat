import passport from '../../../../src/auth/passport'

export default function handler(req, res) {
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    accessType: 'offline',
    prompt: 'consent', // Ensure the user is prompted for consent to grant the Gmail scope
    includeGrantedScopes: true, // This enables incremental authorization
    state: req.query.redirectUrl || '/',
  })(req, res);
}
