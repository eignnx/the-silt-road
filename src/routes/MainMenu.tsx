import { Link } from 'react-router-dom';

export default function MainMenu() {
    return (<>
        <h1>Main Menu</h1>
        <Link to="/game">Enter Game</Link>
    </>);
}