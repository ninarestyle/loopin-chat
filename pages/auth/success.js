import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { updateAccessTokenInDB, setupGmailWatch } from '../../src/services/authService';

export default function AuthSuccess ()
{
    const router = useRouter();
    const [ loading, setLoading ] = useState( true );
    const [ error, setError ] = useState( null );

    useEffect( () =>
    {
        // Wait for `router.isReady` before accessing query parameters
        if ( !router.isReady ) return;

        // Extract tokens from query parameters
        const { accessToken, idToken, profileURL, refreshToken } = router.query;
        const clientType = 1;

        if ( accessToken && idToken && refreshToken )
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
                    clientType,
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
                .then( async ( data ) =>
                {
                    const responseData = data.data?.payload;
                    // Check if JWT token and user profile are present
                    if ( responseData && responseData.jwt )
                    {
                        const jwtToken = responseData.jwt;
                        const user = responseData.user;
                        const userName = user.name || 'Guest User';

                        // Save the JWT token and user info in localStorage
                        localStorage.setItem( 'jwtToken', jwtToken );
                        localStorage.setItem( 'userName', userName );
                        localStorage.setItem( 'userId', user.id );

                        console.log("google access token", user.googleAccessToken)
                        if ( user.googleAccessToken && user.googleAccessToken.length > 0 )
                        {
                            localStorage.setItem( 'accessTokenAvailable', 'true' ); // Store it as a string
                        }

                        // Call `updateAccessTokenInDB` to update the access token in the backend
                        const isUpdated = await updateAccessTokenInDB( accessToken, refreshToken, jwtToken );
                        if ( !isUpdated )
                        {
                            console.error( 'Failed to update access token in the backend.' );
                            setError( 'Failed to update access token. Please try again.' );
                            setLoading( false );
                            return;
                        }

                        // Call setupGmailWatch to register for Gmail push notifications
                        await setupGmailWatch();

                        // Set loading to false after successful data handling
                        setLoading( false );

                        // Redirect the user after successful login and update
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
    }, [ router.isReady ] ); // Wait for `router.isReady` before accessing `router.query`

    if ( loading )
    {
        return <div>Loading...</div>;
    }

    if ( error )
    {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="success-message">
            <p>Welcome, {localStorage.getItem( 'userName' )}!</p>
            <p>You have successfully logged in.</p>
        </div>
    );
}
