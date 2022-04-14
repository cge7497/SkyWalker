import * as main from './main.js';
import * as level from './level.js';

//I got this code from class assignments. In particular https://github.com/IGM-RichMedia-at-RIT/body-parse-example-done/blob/master/client/client.html
const handleResponse = async (response, name) => {

    const content = document.querySelector('#createResponse');
    let shouldParse = true, success = true;
    //Based on the status code, display something
    switch (response.status) {
        case 200: //Success- the name we sent already holds data on the server. 
            content.innerHTML = `<b>Logged in as existing user ${name}</b>`;
            break;
        case 201: //Success- player created
            content.innerHTML = `<b>Now playing as new player ${name}</b>`;
            break;
        case 400: //bad request
            content.innerHTML = `<b>Bad Login Request</b>`; success = false;
            break;
        default: //any other status code
            content.innerHTML = `Error code not implemented by client.`; success = false;
            break;
    }

    const obj = await response.json();
    if (obj.message) {
        content.innerHTML += `<p>${obj.message}</p>`;
    }
    //If the player was created/logged in as, run init in the main game code.
    if (success) {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.value = "Logged in";
        submitBtn.disabled = true;
        document.getElementById('resetBtn').disabled=false;
        if (obj) main.init(obj, name);
    }
};

// sends the player data to the server as a POST request.
const sendPlayer = async (nameForm) => {

    //Grab all the info from the form
    const name = nameForm.querySelector('#nameField').value;
    //const age = nameForm.querySelector('#ageField').value;
    const age = '';
    const color = nameForm.querySelector('#colorField').value;

    //Build a data string in the FORM-URLENCODED format.
    const formData = `name=${name}&age=${age}&color=${color}`;

    let response = await fetch('/addPlayer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
        },
        body: formData,
    });

    //Once we have a response, handle it.
    handleResponse(response, name);
};

//Hooks up the form submission button to the sendPost function.
const init = () => {
    level.getData(); //get the level data before the player loads, so that it is ready.
    
    const playerForm = document.querySelector('#playerForm');

    const addPlayer = (e) => {
        e.preventDefault(); //prevents the default action (which would invovle refreshing the page.)
        sendPlayer(playerForm);
        return false;
    }

    //Call addUser when the submit event fires on the form.
    playerForm.addEventListener('submit', addPlayer);
};

//When the window loads, run init.
window.onload = init;
