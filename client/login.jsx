const helper = require('./helper.js');
const level = require('./level.js');
const game = require('./main.js');

const handleLogin = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const _csrf = e.target.querySelector('#_csrf').value;

    if (!username || !pass){
        helper.handleError('Username or password is empty!');
        return false;
    }

    helper.sendPost(e.target.action, {username, pass, _csrf}, game.init);
    return false;
}


const handleSignup = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;
    const _csrf = e.target.querySelector('#_csrf').value;

    if (!username || !pass || !pass2){
        helper.handleError('All fields are required!');
        return false;
    }

    if (pass !== pass2){
        helper.handleError('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, {username, pass, pass2, _csrf}, game.init);
    return false;
};

const LoginWindow = (props) => {
    return (
        <form id = "loginForm"
        name = "loginForm"
        onSubmit = {handleLogin}
        action = "/login"
        method = "POST"
        className = "mainForm"
        >
            <div className= "floatLeft">
            <label htmlFor="username">Username: </label>
            <input id = "user" type = "text" name = "username" placeholder = "username" />
            </div>
            <div className= "floatRight">
            <label htmlFor = "pass">Password: </label>
            <input id = "pass" type = "password" name = "pass" placeholder = "password" />
            </div>
            <br />
            <input id = "_csrf" type = "hidden" name = "_csrf" value = {props.csrf} />
            <input className = "formSubmit" type = "submit" value = "Log in" />
        </form>
    );
}; 

const SignupWindow = (props) => {
    return (
        <form id = "signupForm"
        name = "signupForm"
        onSubmit = {handleSignup}
        action = "/signup"
        method = "POST"
        className = "mainForm"
        >
            <div className= "floatLeft">
            <label htmlFor="username">Username: </label>
            <input id = "user" type = "text" name = "username" placeholder = "username" />
            </div>
            <div className= "floatRight">
            <label htmlFor = "pass">Password: </label>
            <input id = "pass" type = "password" name = "pass" placeholder = "password" />
            </div>
            <div className= "floatLeft">
            <label htmlFor = "colorField">Color: </label>
            <input id="colorField" type="color" name="color" />
            </div>
            <div className= "floatRight">
            <label htmlFor = "pass2">Password: </label>
            <input id = "pass2" type = "password" name = "pass2" placeholder = "password" />
            </div>
            <br />
            <input id = "_csrf" type = "hidden" name = "_csrf" value = {props.csrf} />
            <input className = "formSubmit" type = "submit" value = "Create Account" />
        </form>
    );
}; 

const init = async () => {
    level.getData();

    const response = await fetch('/getToken');
    const data = await response.json();

    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');

    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        ReactDOM.render(<LoginWindow csrf = {data.csrfToken} />,
        document.getElementById('content'));
        signupButton.style.visibility = "visible";
        loginButton.style.visibility = "hidden";
        return false;
    });

    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        ReactDOM.render(<SignupWindow csrf={data.csrfToken} />,
            document.getElementById('content'));
        signupButton.style.visibility = "hidden";
        loginButton.style.visibility = "visible";
        return false;
    });

    ReactDOM.render(<LoginWindow csrf = {data.csrfToken} />,
        document.getElementById('content'));
};

window.onload = init;