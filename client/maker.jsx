const helper = require('./helper.js');

const handleDomo = (e) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#domoName').value;
    const age = e.target.querySelector('#domoAge').value;
    const favThing = e.target.querySelector('#domoFavThing').value;
    const _csrf = e.target.querySelector('#_csrf').value;

    if (!name || !age || !favThing){
        helper.handleError('All fields are required!');
        return false;
    }

    helper.sendPost(e.target.action, {name, age, favThing, _csrf}, loadDomosFromServer);

    return false;
};

const DomoForm = (props) => {
    return (
        <form id = "domoForm"
        name = "domoForm"
        onSubmit = {handleDomo}
        action = "/maker"
        method = "POST"
        className = "domoForm"
        >
            <label htmlFor="name">Name: </label>
            <input id = "domoName" type = "text" name = "name" placeholder = "Domo Name" />
            <label htmlFor = "age">Age: </label>
            <input id = "domoAge" type = "number" min = "0" name = "age" />
            <label id = "favThingLabel" htmlFor="favThing">Fav Thing: </label>
            <input id = "domoFavThing" type = "text" name = "favThing" placeholder = "Favorite Thing" />
            <input id = "_csrf" type = "hidden" name = "_csrf" value = {props.csrf} />
            <input className = "makeDomoSubmit" type = "submit" value = "Make Domo" />
        </form>
    );
};

const DomoList = (props) => {
    if (props.domos.length === 0){
        return (
            <div className = "domoList">
                <h3 className = "emptyDomo">No Domos Yet!</h3>
            </div>
        );
    }

    const domoNodes = props.domos.map(domo => {
        return (
            <div key={domo._id} className = "domo">
                <img src = "/assets/img/domoface.jpeg" alt = "domo face" className="domoFace" />
                <h3 className = "domoName"> Name: {domo.name}</h3>
                <h3 className = "domoFavThing">Fav Thing: {domo.favThing}</h3>
                <h3 className = "domoAge">Age: {domo.age}</h3>
            </div>
        );
    });

    return (
        <div className = "domoList">
            {domoNodes}
        </div>
    );
};

const loadDomosFromServer = async () => {
    const response = await fetch('/getDomos');
    const data = await response.json();
    ReactDOM.render(
        <DomoList domos = {data.domos} />,
        document.getElementById('domos')
    );
};

const init = async () => {
    const response = await fetch('/getToken');
    const data = await response.json();

    ReactDOM.render(
        <DomoForm csrf={data.csrfToken} />,
        document.getElementById('makeDomo')
    );
    ReactDOM.render(
        <DomoList domos = {[]} />,
        document.getElementById('domos')
    );
    loadDomosFromServer();
};

window.onload = init;