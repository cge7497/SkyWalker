/* Takes in an error message. Sets the error message up in html, and
   displays it to the user. Will be hidden by other events that could
   end in an error.
*/
const handleError = (message) => {
    document.getElementById('createResponse').textContent = message;
};

/* Sends post requests to the server using fetch. Will look for various
   entries in the response JSON object, and will handle them appropriately.
*/
const sendPost = async (url, data, handler) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    document.getElementById('createResponse').textContent = "";
        
    if (result.error) {
        return handleError(result.error);
    }

    if (result.message) {
        document.getElementById('createResponse').textContent = result.message;
    }

    if (result.redirect) {
        window.location = result.redirect;
    }

    // If the result includes a username, this means the player just logged in or signed up, and the game will load.
    if (result.username){
        document.getElementById('createResponse').textContent = "Logged in as " + result.username;
        document.getElementById('resetBtn').disabled = false;
        document.getElementById('signupButton').disabled = true;
        document.getElementById('loginButton').disabled = true;
    }

    if (handler){
        handler(result);
    }
};

const hideError = () => {
    document.getElementById('createResponse').textContent = "";
};

module.exports = {
    handleError,
    sendPost,
    hideError,
};