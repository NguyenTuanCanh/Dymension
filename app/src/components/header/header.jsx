import { ConnectButton } from "@rainbow-me/rainbowkit";

import { ReactSVG } from "react-svg";

import "./header.css";

const NAV_BAR_IDS = {
  HONE: 1,
  FAUCET: 2,
}

function Header(props) {
  
  return (
    <div className="header">
      <ReactSVG src="./public/dymension-logo.svg" />
      <div className="navBar">
        <span onClick={() => props.onChangeNavBar(NAV_BAR_IDS.HONE)} className={`${props.navBarId === NAV_BAR_IDS.HONE ? "active" : ''}`}>Home</span>
        <span onClick={() => props.onChangeNavBar(NAV_BAR_IDS.FAUCET)} className={`${props.navBarId === NAV_BAR_IDS.FAUCET ? "active" : ''}`}>Faucet</span>
      </div>
      <div className="connectButton">
        <ConnectButton />
      </div>
    </div>
  );
}

export default Header;
