import passport from '../../../src/auth/passport';

export default function handler(req, res) {
  // Extract the type and redirectUrl from the query
  const { type = 'basic', redirectUrl = '/' } = req.query;
  console.log("OAuth type is:", type);
  console.log("Redirect URL is:", redirectUrl);

  let scope = ['profile', 'email', 'openid']; // Default scope

  // Include type and redirectUrl in the state parameter
  const state = JSON.stringify({ type, redirectUrl });

  if (type === 'gmail') {
    // Use the Gmail scope for Gmail-specific flow
    scope = ['https://www.googleapis.com/auth/gmail.readonly'];
  }

  passport.authenticate('google', {
    scope,
    accessType: 'offline',
    prompt: 'consent',
    includeGrantedScopes: true,
    state, // Pass type and redirectUrl as state
  })(req, res);
}
