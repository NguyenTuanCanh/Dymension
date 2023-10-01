import { useState } from "react";

import "./App.css";

import Header from './components/header/header'
import Footer from './components/footer/footer'
import Claim from './components/claim/claim'

import { NAV_BAR_IDS } from "./constants/main.js";

function App() {
  const [navBarId, setNavBarId] = useState(NAV_BAR_IDS.HONE);
  const onChangeNavBar = (id) => setNavBarId(id)

  return (
    <div style={container}>
      <Header onChangeNavBar={onChangeNavBar} navBarId={navBarId} />
      <Claim navBarId={navBarId} />
      <Footer />
    </div>
  );
}

const container = {
  maxWidth: "1400px",
  height: "100vh",
  padding: "40px",
  margin: "auto",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

export default App;
