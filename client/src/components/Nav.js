import whiteLogo from '../images/KupidKopija.png'
import colorLogo from '../images/KupidKopija.png'

const Nav = ({authToken,minimal,setShowModal,showModal,setIsSignUp}) => {

    const handleClick = () => {
        setShowModal(true)
        setIsSignUp(false)
    }
    
    

    return(
        <nav>
            <div className="logo-container">
                <img className="logo" src={minimal ? colorLogo : whiteLogo} alt="Tinder logo" />

            </div>
            {!authToken && !minimal && <button className="nav-button"
            onClick={handleClick}
            disabled={showModal}
            >Log In</button>}
        </nav>
        
    )
}
export default Nav