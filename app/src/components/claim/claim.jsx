import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";

import DymensionNameNFT from "../../constants/DymensionNameNFT.json";
import toast, { Toaster } from "react-hot-toast";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./cliam.css";

import {
  HOST,
  CONTRACT_ADDRESS,
  EL_DYMENSION_NAME_SPAN,
  STATUS_NAME,
  MAX_LENGTH_NAME,
  NAV_BAR_IDS,
} from "../../constants/main.js";

function Claim(props) {
  const [nftContract, setNftContract] = useState(null);

  const [mintedNFT, setMintedNFT] = useState(null);
  const [dymensionName, setDymensionName] = useState("");
  const [styleForInput, setStyleForInput] = useState(dymensionNameInput);
  const [statusName, setStatusName] = useState("");
  const [disabledBtn, setDisabledBtn] = useState(true);
  const [walletAddress, setWalletAddress] = useState(null);

  const [dymensionAdress, setDymensionAdress] = useState("");
  const [disabledFaucetBtn, setDisabledFaucetBtn] = useState(true);

  const handleMintDymensionName = async () => {
    if (disabledBtn) return;
    if (!walletAddress) {
      await onMountContract();
      if (!walletAddress) {
        return toast.error("Please connect your wallet!");
      }
    }
    try {
      setMintedNFT(false);
      if (window?.ethereum) {
        let nftTx = await nftContract.createDymensionNameNFT(
          dymensionName + ".dym"
        );
        toast("Your name is minting !", {
          icon: "👏",
        });

        onChangeDymensionName("");
        setNftMitingToStore(dymensionName + ".dym", nftTx.from);

        let tx = await nftTx.wait();
        console.log(nftTx);
        console.log(tx);
        let event = tx.events[0];
        let value = event.args[2];
        let tokenId = value.toNumber();

        setNftToStore(dymensionName + ".dym", tokenId);
        toast.success("Your name is mined !");
        alertNftInfo(tokenId);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      toast.error("Something went wrong!");
      console.log("Error minting character", error);
    } finally {
      setMintedNFT(true);
    }
  };

  const handleFaucet = async () => {
    try {
      const params = { address:  dymensionAdress};
      await axios.post(`${HOST}/faucet`, params);

      toast.success("Can wait up to 24 hours!");
    } catch (error) {
      console.log(error);
    }
  }

  const setNftToStore = async (name, id) => {
    try {
      const params = { name, id };
      await axios.post(`${HOST}/nft`, params);
    } catch (error) {
      console.log(error);
    }
  };

  const setNftMitingToStore = async (name, owner) => {
    try {
      const params = { name, owner };
      await axios.post(`${HOST}/nft-minting`, params);
    } catch (error) {
      console.log(error);
    }
  };

  const onCheckExistDymensionName = async () => {
    try {
      const { data } = await axios.post(`${HOST}/check-nft-exist`, {
        name: dymensionName + ".dym",
      });
      const statusName = data.isExist
        ? STATUS_NAME.Unavailable
        : STATUS_NAME.Available;
      setStatusName(statusName);
      setDisabledBtn(data.isExist);
    } catch (error) {
      console.log(error);
    }
  };

  const alertNftInfo = (tokenId) =>
    setTimeout(() => {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } nftInfo`}
          >
            <FontAwesomeIcon
              onClick={() => toast.dismiss(t.id)}
              icon="fa-times"
            />
            <div>Token Id: {tokenId}</div>
            <div>Address: {CONTRACT_ADDRESS}</div>
          </div>
        ),
        {
          duration: 60000,
        }
      );
    }, 3000);

  const getWidthDymensionNameInput = () =>
    document.getElementById(EL_DYMENSION_NAME_SPAN).offsetWidth;

  const handleSetWidthDymensionNameInput = () =>
    setTimeout(() => {
      setStyleForInput({
        ...dymensionNameInput,
        width: `${getWidthDymensionNameInput() || 200}px`,
      });
    }, 10);

  const onChangeDymensionName = (e) => {
    let nameCel = e.replace(/[^\w\s]/gi, "");
    if (nameCel.length > MAX_LENGTH_NAME) return;
    setDymensionName(nameCel);
    handleSetWidthDymensionNameInput();
  };

  const onChangeDymensionAdress = (e) => {
    setDymensionAdress(e)
  }

  const onFocusInput = () => {
    document.getElementById("dymensionNameInput").focus();
  };

  const onMountContract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      DymensionNameNFT.abi,
      signer
    );
    const walletAdress = await signer.getAddress();
    setWalletAddress(walletAdress);
    setNftContract(nftContract);
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      onMountContract();
    }
  }, []);

  useEffect(() => {
    if (dymensionName) {
      onCheckExistDymensionName();
    } else {
      setStatusName("");
      setDisabledBtn(true);
    }
  }, [dymensionName]);

  useEffect(() => {
    setDisabledBtn(!mintedNFT);
  }, [mintedNFT]);

  useEffect(() => {
    setDisabledFaucetBtn(!dymensionAdress)
  }, [dymensionAdress])

  async function checknetworks() {
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });

        if(chainId !== "0x91618b") {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x91618b" }]
          });
        }

      } catch (error) {
        console.error("Failed to check custom chain", error);
      }
    } else {
      console.error("MetaMask extension not detected");
    }
  }

  useEffect(() => {
    checknetworks()
  });

  return (
    <div style={main}>
      { props.navBarId === NAV_BAR_IDS.HONE &&
        <div style={mainWrap}>
          <h2>Your Name Dymension</h2>
          <div>Claim your free dymension name to experience the fun.</div>
          <div style={mainWrapInput} onClick={onFocusInput}>
            <input
              id="dymensionNameInput"
              style={styleForInput}
              placeholder="dymension name.dym"
              value={dymensionName}
              onChange={(e) => onChangeDymensionName(e.target.value)}
            />
            <span id={EL_DYMENSION_NAME_SPAN} style={spanName}>
              {dymensionName}
            </span>
            {dymensionName && <div style={namePrefix}>.dym</div>}
            <span
              className={`nameStatus ${
                statusName === STATUS_NAME.Unavailable ? "unavailable" : ""
              }`}
            >
              {statusName}
            </span>
          </div>
          <div
            className={`${disabledBtn ? "disabled" : ""}`}
            style={mainWrapButton}
            onClick={handleMintDymensionName}
          >
            Claim your name
          </div>
        </div>
      }
      { props.navBarId === NAV_BAR_IDS.FAUCET && 
        <div>
          <input
            id="dymensionAdressInput"
            style={dymensionAdressInput}
            placeholder="Enter adress ..."
            value={dymensionAdress}
            onChange={(e) => onChangeDymensionAdress(e.target.value)}
        />
          <div
            className={`${disabledFaucetBtn ? "disabled" : ""}`}
            style={btnFaucet}
            onClick={handleFaucet}
          >
            Faucet
          </div>
        </div>
      }
      <Toaster position="bottom-right" reverseOrder={false} height="100px" />
    </div>
  );
}

const main = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mainWrap = {
  width: "650px",
  height: "auto",
  fontSize: "20px",
  widkgroundSize: "cover",
  bath: "344px",
  paddingTop: "20px",
  bacckgroundRepeat: "no-repeat",
  backgroundColor: "#fff",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
};

const mainWrapInput = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "8px 16px 8px 16px",
  gap: "16px",
  width: "539px",
  height: "42px",
  background: "#FFFFFF",
  boxShadow: "0px 2px 10px 2px rgba(0, 0, 0, 0.1)",
  borderRadius: "10px",
  fontSize: "16px",
  outline: "none",
  color: "#A9A9A9",
  marginTop: "50px",
  border: "1px solid #DADCE0",
};

const dymensionNameInput = {
  borderRadius: "10px",
  fontSize: "16px",
  outline: "none",
  color: "#A9A9A9",
  height: "100%",
  border: "none",
};

const spanName = {
  position: "absolute",
  zIndex: -1,
};

const namePrefix = {
  marginLeft: "-18px",
  color: "#555",
};

const mainWrapButton = {
  height: "56px",
  width: "572px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "red",
  color: "white",
  borderRadius: "10px",
  marginTop: "10px",
  cursor: "pointer",
  marginBottom: "50px",
};

const nftInfor = {
  position: "relative",
  borderRadius: "6px",
  padding: "34px",
  textAlign: "start",
  marginBottom: "50px",
  boxShadow: "rgba(0, 0, 0, 0.15) 0px 5px 15px 0px",
};

const hideInfo = {
  position: "absolute",
  right: "-10px",
  top: "-10px",
  height: "26px",
  width: "26px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "14px",
  cursor: "pointer",
  boxShadow:
    "rgb(204, 219, 232) 3px 3px 6px 0px inset, rgba(255, 255, 255, 0.5) -3px -3px 6px 1px inset",
};

const dymensionAdressInput = {
  width: "600px",
  height: "50px",
  padding: "0 12px",
  boder: 'none',
  outline: "none",
}

const btnFaucet = {
  height: "56px",
  width: "628px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "red",
  color: "white",
  marginTop: "10px",
  cursor: "pointer",
  marginBottom: "50px",
}

export default Claim;
