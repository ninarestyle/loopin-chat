import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { updateAccessTokenInDB, setupGmailWatch, fetchRecentPromotions } from '../../src/services/authService';

export default function AuthSuccess() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Wait for `router.isReady` before accessing query parameters
        if (!router.isReady) return;

        const { idToken, accessToken, email, refreshToken, type = 'basic' } = router.query;

        const clientType = 1;

        const logInUser = async (idToken) => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/auth/google/token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken, clientType }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to get JWT, status: ${response.status}`);
                }

                const data = await response.json();
                const responseData = data.data?.payload;

                if (!responseData || !responseData.jwt) {
                    throw new Error('Invalid response from server - missing JWT or user profile');
                }

                const jwtToken = responseData.jwt;
                const user = responseData.user;
                const userName = user.name || 'Guest User';

                // Save the JWT token and user info in localStorage
                localStorage.setItem('jwtToken', jwtToken);
                localStorage.setItem('userName', userName);
                localStorage.setItem('userId', user.id);


                return jwtToken; // Return the JWT for further use
            } catch (error) {
                console.error('Error during login:', error);
                setError('Authentication failed. Please try again.');
                setLoading(false);
                return null;
            }
        };

        const integrateGmail = async (jwtToken) => {
            try {
                if (!accessToken || !refreshToken) {
                    console.error('Missing access or refresh token for Gmail scope.');
                    setError('Missing required tokens for Gmail access. Please try again.');
                    setLoading(false);
                    return;
                }

                if (accessToken && accessToken.length > 0) {
                    localStorage.setItem('accessTokenAvailable', 'true'); // Store it as a string
                }

                // Update the access token in the backend
                const isUpdated = await updateAccessTokenInDB(email, accessToken, refreshToken, jwtToken);
                if (!isUpdated) {
                    console.error('Failed to update access token in the backend.');
                    setError('Failed to update access token. Please try again.');
                    setLoading(false);
                    return;
                }

                // Call `setupGmailWatch` to register for Gmail push notifications
                await setupGmailWatch();

                // Fetch recent Gmail promotions
                await fetchRecentPromotions();

            } catch (error) {
                console.error('Error during Gmail integration:', error);
                setError('Failed to integrate Gmail. Please try again.');
                setLoading(false);
            }
        };

        const processLogin = async () => {
            if (!idToken) {
                setError('Missing ID token. Please try again.');
                setLoading(false);
                return;
            }

            // Log in the user
            const jwtToken = await logInUser(idToken);
            if (!jwtToken) return; // Stop if login fails

            if (type === 'gmail') {
                await integrateGmail(jwtToken);
            }

            // Redirect based on the original URL or default to `/`
            setLoading(false);
            const { originalUrl } = router.query;
            console.log("original url is", originalUrl)
            const targetUrl = originalUrl ? decodeURIComponent(originalUrl) : '/';
            router.push(targetUrl);
        };

        processLogin();
    }, [router, router.isReady]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="success-message">
            <p>Welcome, {localStorage.getItem('userName')}!</p>
            <p>You have successfully logged in.</p>
        </div>
    );
}
