import passport from '../../../../src/auth/passport';

export default function handler ( req, res )
{
  const { code } = req.query;
  // If 'code' is missing, assume the user/tester accessed the URL directly
  if ( !code )
  {
    console.log( "Direct access to the callback URL detected. Redirecting to OAuth flow." );
    return res.redirect( `/api/auth/google?type=basic&redirectUrl=${encodeURIComponent( '/auth/success' )}` );
  }

  passport.authenticate( 'google', { session: false, failureRedirect: '/login' }, ( err, user ) =>
  {
    if ( err || !user )
    {
      console.error( 'Error during Google authentication:', err );
      return res.status( 401 ).json( { error: 'Authentication failed. Please try again.' } );
    }


    // Extract tokens and user information
    const accessToken = user?.accessToken || '';
    const idToken = user?.idToken || '';
    const refreshToken = user?.refreshToken || '';
    const email = user?.emails?.[ 0 ]?.value || '';

    const { state } = req.query;
    let redirectUrl = '/'; // Default redirect
    let type = 'basic'; // Default type

    if ( state )
    {
      try
      {
        const parsedState = JSON.parse( state );
        redirectUrl = parsedState.redirectUrl || '/';
        type = parsedState.type || 'basic';
      } catch ( error )
      {
        console.error( 'Error parsing state:', error );
      }
    }

    // For basic authentication, ensure we have an ID token
    if ( type === 'basic' )
    {
      if ( !idToken )
      {
        console.error( 'ID token is missing for basic authentication.' );
        return res.status( 401 ).json( { error: 'Authentication failed. Missing ID token.' } );
      }

      // Redirect to the specified `redirectUrl` with basic user details
      const authenticatedURL = `${redirectUrl}?idToken=${encodeURIComponent( idToken )}&type=${encodeURIComponent( type )}`;
      res.redirect(
        authenticatedURL
      );
      console.log( "authenticatedURL", authenticatedURL )
      return authenticatedURL;
    }

    // For Gmail access, ensure access and refresh tokens are present
    if ( type === 'gmail' )
    {
      if ( !accessToken || !refreshToken )
      {
        console.error( 'Access or refresh token is missing for Gmail scope.' );
        return res.status( 401 ).json( { error: 'Authentication failed. Missing required tokens for Gmail scope.' } );
      }
      // Redirect to the specified `redirectUrl` with all tokens
      return res.redirect(
        `${redirectUrl}?accessToken=${encodeURIComponent( accessToken )}&refreshToken=${encodeURIComponent( refreshToken )}&idToken=${encodeURIComponent( idToken )}&email=${encodeURIComponent( email )}&type=${encodeURIComponent( type )}`
      );
    }

    // Handle unknown `type` values
    console.error( 'Invalid type parameter in authentication callback:', type );
    return res.status( 400 ).json( { error: 'Invalid authentication type. Please try again.' } );
  } )( req, res );
}
