const gameLogic = require('../client/main.js');

//I followed the structure of this React demo from class: https://github.com/IGM-RichMedia-at-RIT/React-Functional-Components-Done/blob/master/client/example3.jsx
const PlayerDisplay = (props) => {
    const [players, setPlayers] = React.useState(props.players);
    const [displayMode, setDisplayMode] = React.useState(props.displayMode);

    React.useEffect(async () => {
        // Only send the fetch request when the button/display opens- and not when it closes as it wouldn't be displayed..
        if (displayMode === 1) {
            const response = await fetch('/getPlayers');
            const players = await response.json();
            setPlayers(players)
        }
    }, [displayMode]);

    const changeDisplay = () => {
        //if (!displayMode)  return setDisplayMode(0);

        if (displayMode == 0) setDisplayMode(1);
        else setDisplayMode(0);
    };

    if (!displayMode || displayMode === 0) {
        // render the objects with the className
        return (
            <button id="playerDisplayBtn" onClick={(e) => { changeDisplay() }}> O -|- /\</button>
        )
    }
    if (!players || players.length === 0) {
        return (
            <div id="playerDisplayList">
                <button id="closeWidgetBtn" onClick={changeDisplay}>X</button>
                <h2>No Players Yet...</h2>
            </div>
        )
    }

    const playerList = players.map((p) => {
        return (
            <tr key={p.username}>
                <td>{p.username}</td>
                <td className="colorText" style={{ backgroundColor: p.color }}></td>
            </tr>
        )
    })

    return (
        <div id="playerDisplayList">
            <button id="closeWidgetBtn" onClick={changeDisplay}>X</button>
            <table>
                <caption><h3><u>Current Players</u></h3></caption>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Color</th>
                    </tr>
                </thead>
                <tbody>
                    {playerList}
                </tbody>
            </table>
        </div>
    );
};

const GameInfo = (props) => {

    return (
        <div className="center">
            {/*} I got the screw attack image from https://strategywiki.org/wiki/File:SMetroidScrewAttackIcon.png, 
    and the morph ball image from https://strategywiki.org/wiki/File:Super_Metroid_Items_Morph_Ball.png, 
    though they are both originally from Super Metroid games.
    The Yellow Button image is from Super Mario World, and I got it from here: https://strategywiki.org/wiki/Super_Mario_World/Yellow_Switch_Palace 
    {*/}
            <h3>Items</h3>
            <img id="screwattack" src='assets/img/screwattack.png' style={{ display: 'none' }} width="16" height="16"
                alt="Infinite Flip Powerup" />
            <img id="morphball" src='assets/img/morphball.png' style={{ display: 'none' }} width="16" height="16"
                alt="Shrinking Powerup" />
            <img id="yellowswitch" src='assets/img/yellowswitch.png' style={{ display: 'none' }} width="32" height="32"
                alt="Final Powerup" />
            {/* Update this inner html when you get an item. */}
            <div className="center" id="instructions">
                <div id="moveInstructions" className="inline">Use '<strong>A</strong>' and
                    '<strong>D</strong>'
                    to move, </div>
                <div id="spaceInstructions" className="inline"> <strong>&nbsp;SPACE</strong> to flip.
                </div>
            </div>

            <button id="resetBtn" disabled={true}>Back to Start</button>
        </div>
    )
};

const BuyShape = (props) => {

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
            className="inputForm"
        >
            <div className="floatLeft">
                <label htmlFor="oldPass">Payment Example: </label>
                <input id="oldPass" type="text" name="oldPass" placeholder="Payment Info" />
            </div>
            <div className="floatRight">
                <label htmlFor="newPass">Payment Example: </label>
                <input id="newPass" type="text" name="newPass" placeholder="Payment Info" />
            </div>
            <button type='button' id="closeForm" onClick={(e) => { setDisplayMode(0) }}>Close Form</button>
            <input className="formSubmit" id="changePasswordSubmit" type="submit" disabled={true} value="Purchase (Demo)" />
        </form>
    );
};

const setShape = async (shape) => {
    const _csrf = document.getElementById('_csrf').value;
    const data = { shape, _csrf };

    ReactDOM.render(<BuyShape displayMode={2} />, document.getElementById('formContent'));

    const response = await fetch('/setShape', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    gameLogic.setShape(shape);
}

//I followed the structure of this React demo from class: https://github.com/IGM-RichMedia-at-RIT/React-Functional-Components-Done/blob/master/client/example3.jsx
const PayModelDisplay = (props) => {
    const [displayMode, setDisplayMode] = React.useState(props.displayMode);
    const [disabled, setDisabled] = React.useState(props.disabled);
    const [selected, setSelected] = React.useState(props.selected);

    React.useEffect(async () => {
        setDisabled(props.disabled);
        setSelected(props.selected);
    }, [props]);

    const changeDisplay = () => {
        if (displayMode === 0) setDisplayMode(1);
        else setDisplayMode(0);
    };

    if (!displayMode || displayMode === 0) {
        return (
            <button disabled={disabled} id="payModelBtn" onClick={changeDisplay}>&nabla; &#9634; &#9671;</button>
        )
    }

    const ShapeList = () => {
        return (
            <table id="payModelTable">
                <caption><h3><u>Shape Shop</u></h3></caption>
                <thead>
                    <tr>
                        <th>Shape</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className={selected == 0 ? "selected" : ""} onClick={(e) => { setSelected(0); setShape(0); }}>
                        <td>Circle</td>
                        <td><em>$ Free </em></td>
                    </tr>
                    <tr className={selected == 1 ? "selected" : ""} onClick={(e) => { setSelected(1); setShape(1); }}>
                        <td><strong>Big</strong></td>
                        <td><em>$ Free </em></td>
                    </tr>
                    <tr className={selected == 2 ? "selected" : ""} onClick={(e) => { setSelected(2); setShape(2); }}>
                        <td>Tiny</td>
                        <td><em>$ Free </em></td>
                    </tr>
                    <tr className={selected == 3 ? "selected" : ""} onClick={(e) => { setSelected(3); setShape(3); }}>
                        <td>Spider</td>
                        <td><em>$ Free </em></td>
                    </tr>
                    <tr className={selected == 4 ? "selected" : ""} onClick={(e) => { setSelected(4); setShape(4); }}>
                        <td><em>Handsome</em></td>
                        <td><em>$ Free </em></td>
                    </tr>
                </tbody>
            </table>
        )
    };

    return (
        <div id="payModelDisplay">
            <button id="closeWidgetBtn" onClick={changeDisplay}>X</button>
            <ShapeList />
        </div>
    );
};

const init = () => {
    ReactDOM.render(<GameInfo />,
        document.getElementById('gameInfo'));

    ReactDOM.render(<PlayerDisplay players={[]} displayMode={0} />,
        document.getElementById('playerDisplay'));

    ReactDOM.render(<PayModelDisplay displayMode={0} disabled={true} selected = {0}/>,
        document.getElementById('payModel'));
};

module.exports = {
    PlayerDisplay,
    GameInfo,
    PayModelDisplay,
    init
}