/**
 * Updates the user's access token in the backend database.
 *
 * @param {string} accessToken - The new access token to be saved.
 * @returns {Promise<boolean>} - Returns `true` if the token was successfully updated, otherwise `false`.
 */
export async function updateAccessTokenInDB(accessToken, refreshToken, jwtToken) {
    if (!accessToken) {
      console.error('Access token is missing.');
      return false;
    }

    if (!jwtToken) {
        console.error('jwt token is missing.');
        return false;
      }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/auth/save-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`, // Include the JWT token in the Authorization header
        },
        body: JSON.stringify({
          accessToken,
          refreshToken
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update access token:', errorData);
        return false;
      }
  
      console.log('Access token updated successfully.');
      return true;
    } catch (error) {
      console.error('Error updating access token:', error);
      return false;
    }
  }

  // Frontend: Trigger Gmail Watch Setup
  export async function setupGmailWatch() {
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) {
      alert('Please log in first.');
      return;
    }
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/gmail/setup-watch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ clientType: 1 }), 
      });
  
      if (response.ok) {
        alert('Gmail notifications have been set up successfully.');
      } else {
        const errorData = await response.json();
        console.error('Failed to set up Gmail notifications:', errorData);
        alert('Failed to set up Gmail notifications. Please try again.');
      }
    } catch (error) {
      console.error('Error setting up Gmail notifications:', error);
      alert('An error occurred while setting up Gmail notifications.');
    }
  };
  
  