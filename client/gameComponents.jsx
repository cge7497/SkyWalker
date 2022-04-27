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

module.exports = {
    PlayerDisplay
}