import "./Navbar.css";

export default function Navbar() {
    return (
        <nav className="navbar">

            <div className="logo">

                <h2>
                    TED<span>X</span>pedition
                </h2>

            </div>

            <div className="navLinks">

                <a href="#about">About</a>
                <a href="#rules">Rules</a>
                <a href="#contact">Contact</a>

            </div>

        </nav>
    );
}