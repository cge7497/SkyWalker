// Handles the response from the POST request sent to the server to update the player with the item they received.
// I got this code from class assignments. In particular https://github.com/IGM-RichMedia-at-RIT/body-parse-example-done/blob/master/client/client.html
const handleResponse = async (response) => {

    let obj;
    switch (response.status) {
        case 200: // Player created with those items... Right now, this is not allowed by the server.
            obj = await response.json();
            break;
        case 204: // Existing player has been updated with those items.
            break;
        default: //any other status code
            console.error(obj);
            break;
    }
    return obj;
};

// sends the player data to the server as a POST request.
const updatePlayer = async (name, itemId) => {
    //Build a data string in the FORM-URLENCODED format.
    const _csrf = document.querySelector('#_csrf').value;
    const formData = { username: name, item: itemId, _csrf: _csrf };


    let response = await fetch('/updateItems', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            
        },
        body: JSON.stringify(formData),
    });
};

// sends the player data to the server as a POST request.
const sendRequestForInfo = async (name) => {
    let response = await fetch('/...' + name + '...', {
        method: 'GET',
        headers: {
            'Accept': 'image/*',
        },
    });

    //Once we have a response, handle it.
    let obj = await response.json();

    switch (response.status) {
        case 200:
            break;
        case 204:
            break;
        default: //any other status code
            console.error(obj);
            break;
    }
    return obj;
};

const sendCloud = async (color = '#000000') => {
    const _csrf = document.querySelector('#_csrf').value;

    //Build a data string in the FORM-URLENCODED format.
    const formData = { color: color, _csrf: _csrf }

    let response = await fetch('/addCloud', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
    });
}
export {
    updatePlayer, sendRequestForInfo, sendCloud
}