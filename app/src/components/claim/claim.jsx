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
  DYMENSION_1,
  DYMENSION_2,
  DYMENSION_3
} from "../../constants/main.js";

function Claim(props) {
  const img = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='purple' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>"
  const [nftContract, setNftContract] = useState(null);

  const [mintedNFT, setMintedNFT] = useState(null);
  const [dymensionName, setDymensionName] = useState("");
  const [styleForInput, setStyleForInput] = useState(dymensionNameInput);
  const [statusName, setStatusName] = useState("");
  const [disabledBtn, setDisabledBtn] = useState(true);
  const [walletAddress, setWalletAddress] = useState(null);
  const [priceNft, sePriceNft] = useState("0.0000");
  const [imageNft, seImageNft] = useState(DYMENSION_1);

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
          dymensionName + ".dym", 
          imageNft,
          { value: ethers.utils.parseEther(`${priceNft}`)}
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
      if(error.data?.code === -32000) {
        toast.error("Insufficient balance for transfer!");
      } else {
        toast.error("Something went wrong!");
      }
      console.log("Error minting character", error);
    } finally {
      setMintedNFT(true);
    }
  };

  const handleFaucet = async () => {
    const provider = new ethers.providers.JsonRpcProvider("https://froopyland.dymension.xyz/8/xxxigm_9527691-1/evmrpc");
    const privateKey = "e9d6034e5c8dadeddc0a2c90dc9e04aee5af1bbd389f2b51e98d7a2485d82e0a";
    const wallet = new ethers.Wallet(privateKey, provider);
    const recipientAddress = dymensionAdress;
    const amountToSend = ethers.utils.parseEther("1");
    const transaction = {
      to: recipientAddress,
      value: amountToSend,
    };

    toast('Please wait a few seconds!', {
      icon: '👏',
      duration: 8000,
    });

    setDisabledFaucetBtn(true)

    wallet.sendTransaction(transaction)
    .then(() => {
      toast.success("Faucet is successful!");
    })
    .catch(() => {
      toast.error("Something went wrong!");
    })
    .finally(() => {
      setDymensionAdress('')
    });
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
      const statusName = 
        dymensionName === '' ? '' 
        : data.isExist
        ? STATUS_NAME.Unavailable
        : STATUS_NAME.Available;
      setStatusName(statusName);
      setDisabledBtn(data.isExist || !dymensionName);
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
    setTimeout(() => {
      let nameCel = e.replace(/[^\w\s]/g, "").replace(/\s/g, "");
      if (nameCel.length > MAX_LENGTH_NAME) return;
      setDymensionName(nameCel);
      handleSetWidthDymensionNameInput();
    }, 10);
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

  const getInfoNft = () => {
    if (dymensionName.length === 0) return sePriceNft('0.0000')

    if(dymensionName.length === 1) {
      sePriceNft(0.9)
      seImageNft(DYMENSION_3)
    } else if(dymensionName.length >1 && dymensionName.length < 4) {
      sePriceNft(0.6)
      seImageNft(DYMENSION_2)
    } else {
      sePriceNft(0.3)
      seImageNft(DYMENSION_1)
    }
  }

  useEffect(() => {
    if (typeof document !== "undefined") {
      onMountContract();
    }
  }, []);

  useEffect(() => {
    const handle = async() => {
      await onCheckExistDymensionName();
      getInfoNft()
    }

    handle()
  }, [dymensionName]);

  useEffect(() => {
    setDisabledBtn(mintedNFT);
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
        addNetwork()
      }
    } else {
      console.error("MetaMask extension not detected");
    }
  }

  const addNetwork = function() {
    const networkInfo = {
      chainId: "0x91618b",
      chainName: 'Dymension',
      nativeCurrency: {
          name: 'Dymension',
          symbol: 'DAS',
          decimals: 18,
      },
      rpcUrls: ['https://froopyland.dymension.xyz/8/xxxigm_9527691-1/evmrpc'],
    };
  
    ethereum
        .request({
            method: 'wallet_addEthereumChain',
            params: [networkInfo],
        })
        .then(() => {
            ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x91618b" }]
            });
        })
        .catch((error) => {
            console.error('Error adding network to MetaMask:', error);
        });
  }

  useEffect(() => {
    checknetworks()
  }, []);

  return (
    <div style={main}>
      { props.navBarId === NAV_BAR_IDS.HONE &&
        <div style={mainWrap}>
          <h2 style={tittle}>Register a .dym Name</h2>
          <div>Claim your <strong>.dym</strong> domain name. Mint your rare gems 💎</div>
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
          <div style={mainWrapPrice}>
            <div>
              {priceNft}
            </div>
            <div style={spanSymbol}>
              DAS
            </div>
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
            placeholder="Enter your evm address ..."
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
  width: "600px",
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
  marginBottom: "150px",
};

const tittle = {
  marginBottom: "15px",
};

const mainWrapInput = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "8px 16px 8px 16px",
  gap: "16px",
  width: "479px",
  height: "42px",
  background: "#FFFFFF",
  borderRadius: "10px",
  fontSize: "16px",
  outline: "none",
  color: "#A9A9A9",
  marginTop: "50px",
  border: "1px solid #DADCE0",
};

const mainWrapPrice = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 16px 8px 16px",
  width: "479px",
  height: "42px",
  borderRadius: "10px",
  fontSize: "16px",
  color: "#A9A9A9",
  marginTop: "12px",
  border: "1px solid #DADCE0",
}

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

const spanSymbol = {
  color: "black",
}

const namePrefix = {
  marginLeft: "-18px",
  color: "#555",
};

const mainWrapButton = {
  height: "56px",
  width: "514px",
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

const dymensionAdressInput = {
  width: "550px",
  height: "50px",
  padding: "0 12px",
  boder: 'none',
  outline: "none",
}

const btnFaucet = {
  height: "56px",
  width: "576px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "red",
  color: "white",
  marginTop: "10px",
  cursor: "pointer",
  marginBottom: "150px",
}

export default Claim;


