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

    if (oldPass === newPass) {
        helper.handleError('The two passwords are the same!');
        return false;
    }

    helper.sendPost(e.target.action, { oldPass, newPass, _csrf }, resetPasswordForm);
    return false;
}

const resetPasswordForm = (result) => {
    // If the password was successfully changed- meaning the json object has a success message and not an error- reset the password input values so the user can't double click it.
    if (result.message) {
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
                <input id="colorField" type="color" name="color" defaultValue="#6495ed" />
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
    const [displayMode, setDisplayMode] = React.useState(props.displayMode);

    React.useEffect(async () => {
        setDisplayMode(props.displayMode);
    }, [props]);


    if (displayMode === 0) {
        return null;
    }

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
                <input id="oldPass" type="password" name="oldPass" placeholder="password" />
            </div>
            <div className="floatRight">
                <label htmlFor="newPass">New Password: </label>
                <input id="newPass" type="password" name="newPass" placeholder="password" />
            </div>
            <button type='button' id="closeForm" onClick={(e) => { setDisplayMode(0) }}>Close Form</button>
            <input className="formSubmit" id="changePasswordSubmit" type="submit" value="Set Password" />
        </form>
    );
};

const init = async () => {
    level.getData();

    const response = await fetch('/init');
    const data = await response.json();

    gameComponents.init();

    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');
    const changePasswordButton = document.getElementById('changePasswordButton');

    document.getElementById('_csrf').value = data.csrfToken;

    changePasswordButton.addEventListener('click', (e) => {
        e.preventDefault();
        ReactDOM.render(<ChangePasswordWindow displayMode={1} />,
            document.getElementById('formContent'));
        signupButton.disabled = false;
        loginButton.disabled = true;
        return false;
    });

    // If there is already a logged in user for this session stored on the server, just initialize the game.
    if (data.account) {
        initGame(data.account, true);
        document.getElementById('createResponse').textContent = "Logged in as " + data.account.username;
    }
    // If the server does not have an account tied to this session, initalize the signup/login buttons and forms.
    else {
        loginButton.addEventListener('click', (e) => {
            e.preventDefault();
            ReactDOM.render(<LoginWindow />,
                document.getElementById('formContent'));
            signupButton.disabled = false;
            loginButton.disabled = true;
            return false;
        });

        signupButton.addEventListener('click', (e) => {
            e.preventDefault();
            ReactDOM.render(<SignupWindow />,
                document.getElementById('formContent'));
            loginButton.disabled = false;
            signupButton.disabled = true;
            return false;
        });
        ReactDOM.render(<SignupWindow />,
            document.getElementById('formContent'));
    }
};

const initGame = (player, immediate) => {
    game.init(player, immediate);

    ReactDOM.render(<gameComponents.PayModelDisplay displayMode={0} disabled={false} selected = {player.shape} />,
        document.getElementById('payModel'));

    document.getElementById('createResponse').textContent = "Logged in as " + player.username;
    document.getElementById('resetBtn').disabled = false;

    document.getElementById('loginButton').classList.add('hidden');
    document.getElementById('signupButton').classList.add('hidden');

    document.getElementById('changePasswordButton').classList.remove('hidden');
    document.getElementById('logoutLink').classList.remove('hidden');

    ReactDOM.render(null,
        document.getElementById('formContent'));

    return false;
}


window.onload = init;