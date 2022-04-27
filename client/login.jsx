const helper = require('./helper.js');
const level = require('./level.js');
const game = require('./main.js');
const gameComponents = require('./gameComponents.jsx');

const handleLogin = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const _csrf = document.querySelector('#_csrf').value;

    if (!username || !pass) {
        helper.handleError('Username or password is empty!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass, _csrf }, initGame);
    return false;
}


const handleSignup = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;
    const color = e.target.querySelector('#colorField').value;
    const _csrf = document.querySelector('#_csrf').value;

    if (!username || !pass || !pass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if (pass !== pass2) {
        helper.handleError('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass, pass2, color, _csrf }, initGame);
    return false;
};

const handleChangePassword = (e) => {
    e.preventDefault();
    helper.hideError();

    const oldPass = e.target.querySelector('#oldPass').value;
    const newPass = e.target.querySelector('#newPass').value;
    const _csrf = document.querySelector('#_csrf').value;

    if (!oldPass || !newPass) {
        helper.handleError('One or more password fields are empty!');
        return false;
    }

    if (oldPass === newPass){
        helper.handleError('The two passwords are the same!');
        return false;
    }

    helper.sendPost(e.target.action, {oldPass, newPass, _csrf }, resetPasswordForm);
    return false;
}

const resetPasswordForm = (result) => {
    // If the password was successfully changed- meaning the jsob objects haas a success message and not an error- reset the password input values so the user can't double click it.
    if (result.message){
        document.getElementById('oldPass').value = '';
        document.getElementById('newPass').value = '';
    }
}

const LoginWindow = (props) => {
    return (
        <form id="loginForm"
            name="loginForm"
            onSubmit={handleLogin}
            action="/login"
            method="POST"
            className="inputForm"
        >
            <div className="floatLeft">
                <label htmlFor="username">Username: </label>
                <input id="user" type="text" name="username" placeholder="username" />
            </div>
            <div className="floatRight">
                <label htmlFor="pass">Password: </label>
                <input id="pass" type="password" name="pass" placeholder="password" />
            </div>
            <input className="formSubmit" type="submit" value="Log in" />
        </form>
    );
};

const SignupWindow = (props) => {
    return (
        <form id="signupForm"
            name="signupForm"
            onSubmit={handleSignup}
            action="/signup"
            method="POST"
            className="inputForm"
        >
            <div className="floatLeft">
                <label htmlFor="username">Username: </label>
                <input id="user" type="text" name="username" placeholder="username" />
            </div>
            <div className="floatRight">
                <label htmlFor="pass">Password: </label>
                <input id="pass" type="password" name="pass" placeholder="password" />
            </div>
            <div className="floatLeft">
                <label htmlFor="colorField">Color: </label>
                <input id="colorField" type="color" name="color" value = "#6495ed" />
            </div>
            <div className="floatRight">
                <label htmlFor="pass2">Password: </label>
                <input id="pass2" type="password" name="pass2" placeholder="password" />
            </div>
            <input className="formSubmit" type="submit" value="Create Account" />
        </form>
    );
};

const ChangePasswordWindow = (props) => {
    const [defaultText, setDefaultText] = React.useState(props.defaultText);

    return (
        <form id="changePasswordForm"
            name="changePasswordForm"
            onSubmit={handleChangePassword}
            action="/changePassword"
            method="POST"
            className="inputForm"
        >
            <div className="floatLeft">
                <label htmlFor="oldPass">Current Password: </label>
                <input id="oldPass" type="password" name="oldPass" placeholder={defaultText} />
            </div>
            <div className="floatRight">
                <label htmlFor="newPass">New Password: </label>
                <input id="newPass" type="password" name="newPass" placeholder={defaultText} />
            </div>
            <input className="formSubmit" id = "changePasswordSubmit"type="submit" value="Set Password" onClick={(e) => setDefaultText("password")} />
        </form>
    );
};

const init = async () => {
    level.getData();

    const response = await fetch('/getToken');
    const data = await response.json();

    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');
    const logoutButton = document.getElementById('logoutButton');
    const changePasswordButton = document.getElementById('changePasswordButton');

    document.getElementById('_csrf').value = data.csrfToken;

    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        ReactDOM.render(<LoginWindow />,
            document.getElementById('content'));
        signupButton.disabled = false;
        loginButton.disabled = true;
        return false;
    });

    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        ReactDOM.render(<SignupWindow />,
            document.getElementById('content'));
        loginButton.disabled = false;
        signupButton.disabled = true;
        return false;
    });

    changePasswordButton.addEventListener('click', (e) => {
        e.preventDefault();
        ReactDOM.render(<ChangePasswordWindow defaultText = "password"/>,
            document.getElementById('content'));
        signupButton.disabled = false;
        loginButton.disabled = true;
        return false;
    });

    logoutButton.addEventListener('click', async (e) => {
        fetch('/logout');
        window.location.reload();
        return false;
    });

    ReactDOM.render(<SignupWindow />,
        document.getElementById('content'));
};

const initGame = (player) => {
    game.init(player);

    document.getElementById('loginButton').classList.add('hidden');
    document.getElementById('signupButton').classList.add('hidden');

    document.getElementById('changePasswordButton').classList.remove('hidden');
    document.getElementById('logoutButton').classList.remove('hidden');

    ReactDOM.render(null,
        document.getElementById('content'));
    loginButton.disabled = false;
    signupButton.disabled = true;
    return false;
}


window.onload = init;