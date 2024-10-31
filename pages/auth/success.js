import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AuthSuccess ()
{
    const router = useRouter();
    const [ loading, setLoading ] = useState( true );
    const [ error, setError ] = useState( null );
    const [ userName, setUserName ] = useState( "" );

    useEffect( () =>
    {
        // Extract tokens from query parameters
        const { accessToken, idToken, profileURL } = router.query;
        const clientType = 1;

        if ( accessToken && idToken )
        {
            // Make a POST request to exchange the Google access token for a JWT
            fetch( `${process.env.NEXT_PUBLIC_APP_URL}/auth/google/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify( {
                    accessToken,
                    idToken,
                    profileURL,
                    clientType
                } ),
            } )
                .then( ( response ) =>
                {
                    if ( !response.ok )
                    {
                        throw new Error( `Failed to get JWT, status: ${response.status}` );
                    }
                    return response.json(); // Parse JSON from response
                } )
                .then( ( data ) =>
                {
                    const responseData = data.data?.payload;
                    // Check if JWT token and user profile are present
                    if ( responseData && responseData.jwt )
                    {
                        localStorage.setItem( 'jwtToken', responseData.jwt );
                        const user = responseData.user;
                        if ( user.name )
                        {
                            setUserName( user.name );
                        } else
                        {
                            setUserName( "User" );
                        }

                        // Set loading to false after successful data handling
                        setLoading( false );

                        // Redirect the user after successful login
                        router.push( '/' );
                    } else
                    {
                        throw new Error( 'Invalid response from server - missing JWT or userProfile' );
                    }
                } )
                .catch( ( error ) =>
                {
                    console.error( 'Error during token exchange:', error );
                    setError( 'Authentication failed. Please try again.' );
                    setLoading( false );
                } );

        } else
        {
            setLoading( false );
            setError( 'Missing required authentication information. Please try again.' );
        }
    }, [ router.query ] );

    return (
        <div className="success-message">
            <p>Welcome, {userName}!</p>
            <p>You have successfully logged in.</p>
        </div>
    );
}
