//I followed the structure of this React demo from class: https://github.com/IGM-RichMedia-at-RIT/React-Functional-Components-Done/blob/master/client/example3.jsx
const PlayerDisplay = (props) => {
    const [players, setPlayers] = React.useState(props.defaultText);

    React.useEffect(async () => {
        const response = await fetch('/getPlayers');
        const players = response.json();
        setPlayers(players)
    });

    if (players.length === 0) {
        return (
            <div>
                <h2>Loading Players...</h2>
            </div>
        )
    }

    const playerList = players.map((p) => {
        return (
            <table>
                <tr>
                    <th>Username</th>
                    <th>Color</th>
                </tr>
                <tr key={p.username}>
                    <td>{p.username}</td>
                    <td style={{ backgroundColor: p.color }}>{p.color}</td>
                    <td>{p.items}</td>
                </tr>
            </table>
        )
    })

    return (
        <div>
            <h3>Current Players</h3>
            {playerList}
        </div>
    );
};

const GameInfo = (props) => {
    return (
        <div class="center">
            {/*} I got the screw attack image from https://strategywiki.org/wiki/File:SMetroidScrewAttackIcon.png, 
    and the morph ball image from https://strategywiki.org/wiki/File:Super_Metroid_Items_Morph_Ball.png, 
    though they are both originally from Super Metroid games.
    The Yellow Button image is from Super Mario World, and I got it from here: https://strategywiki.org/wiki/Super_Mario_World/Yellow_Switch_Palace */}
            <h3>Items: </h3>
            <img id="screwattack" src="/assets/img/screwattack.png" style="display: none" width="16" height="16"
                alt="Infinite Flip Powerup" />
            <img id="morphball" src="/assets/img/morphball.png" style="display: none" width="16" height="16"
                alt="Shrinking Powerup" />
            <img id="yellowswitch" src="/assets/img/yellowswitch.png" style="display: none" width="32" height="32"
                alt="Final Powerup" />
            {/* Update this inner html when you get an item. */}
            <div class="center" id="instructions">
                <div id="moveInstructions" style="display:inline">Use '<strong>A</strong>' and
                    '<strong>D</strong>'
                    to move, </div>
                <div id="spaceInstructions" style="display:inline"> <strong>SPACE</strong> to flip.
                </div>
            </div>

            <button id="resetBtn" disabled={true}>Back to Start</button>
        </div>
    )
};

const init = () => {
    console.log('wht');
    ReactDOM.render(<GameInfo />,
        document.getElementById('gameInfo'));
}

module.exports = {
    PlayerDisplay,
    GameInfo,
    init
}