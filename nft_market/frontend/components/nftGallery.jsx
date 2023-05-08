import { useEffect, useState } from "react";
import styles from "../styles/nftGallery.module.css"
import { useAccount } from "wagmi";
import NftCard from "./nftCard";
import {Network,Alchemy} from "alchemy-sdk"
export default function NFTGallery({}) {
  const [nfts, setNfts] = useState();
  const [walletOrCollectionAddress, setWalletOrCollectionAddress] =
    useState("vitalik.eth");
  const [fetchMethod, setFetchMethod] = useState("wallet");
  const [pageKey, setPageKey] = useState();
  const [spamFilter, setSpamFilter] = useState(true);
  const [isLoading, setIsloading] = useState(false);
  const { address, isConnected } = useAccount();
  const [chain, setChain] = useState(process.env.NEXT_PUBLIC_ALCHEMY_NETWORK);
  const [reqOptions,setreqOptions] = useState("owner")
  const [endpoint,setEndpoint] = useState("eth-mainnet")
const [request,setRequest] = useState("getNftsForOwner");
const [apikey,setAPIKey] = useState(process.env.ALCHEMY_MAINNET_KEY)
  const changeFetchMethod = (e) => {
    setNfts()
    setPageKey()
    switch (e.target.value) {
      case "wallet":
        setWalletOrCollectionAddress("");
        break;
      case "collection":
        setWalletOrCollectionAddress(
          process.env.MARKET_ADDRESS
        );
        break;
      case "connectedWallet":
        setWalletOrCollectionAddress(address);
        break;
    }
    setFetchMethod(e.target.value);
  };
  const fetchNFTs = async (pagekey) => {
    if (!pageKey) setIsloading(true);
    // const endpoint =
    //   fetchMethod == "wallet" || fetchMethod == "connectedWallet"
    //     ? "getNftsForOwner"
    //     : "getNftsForCollection";
    if( fetchMethod == "wallet" || fetchMethod == "connectedWallet"){
      setRequest("getNFTsForOwner")
      setreqOptions("owner")
    }
    else{
      setRequest("getNFTsForCollection")
      setreqOptions("contractAddress")
    }
    try {
    var requestOptions = {
        method: 'GET'
      };
    let api_key = process.env.ALCHEMY_MAINNET_KEY
    if(chain == 'MATIC_MUMBAI'){
      setEndpoint("polygon-mumbai")
      api_key = process.env.ALCHEMY_MATIC_KEY
    }
    
    else if (chain == 'ETH_MAINNET'){
      setEndpoint("eth-mainnet")
      api_key = process.env.ALCHEMY_MAINNET_KEY
    }

    const baseURL = `https://${endpoint}.g.alchemy.com/v2/${api_key}/${request}/`;
    const fetchURL = `${baseURL}?${reqOptions}=${walletOrCollectionAddress}&withMetadata=true`
    const res = await fetch(fetchURL, requestOptions).then(data => data.json( ))
   
    let flag;
    request == "getNFTsForOwner" ? flag = true : flag = false
      if (!flag) {
        console.log("here2");
        setNfts(res.nfts);
      } else {
        setNfts(res.ownedNfts);
      }
      if (res.pageKey) {
        setPageKey(res.pageKey);
      } else {
        setPageKey();
      }
    } catch (e) {
      console.log(e);
    }
    setIsloading(false);
    
  };

//console.log(endpoint + " endpoint");
  useEffect(() => {
    fetchNFTs();
  }, [fetchMethod]);
  useEffect(() => {
    fetchNFTs();
  }, [spamFilter]);

  return (
    <div className={styles.nft_gallery_page}>
      <div>
        <div className={styles.fetch_selector_container}>
          <h2 style={{ fontSize: "20px" }}>Explore NFTs by</h2>
          <div className={styles.select_container}>
            <select
              defaultValue={"wallet"}
              onChange={(e) => {
                changeFetchMethod(e);
              }}
            >
              <option value={"wallet"}>wallet</option>
              <option value={"collection"}>collection</option>
              <option value={"connectedWallet"}>connected wallet</option>
            </select>
          </div>
        </div>
        <div className={styles.inputs_container}>
          <div className={styles.input_button_container}>
            <input
              value={walletOrCollectionAddress}
              onChange={(e) => {
                setWalletOrCollectionAddress(e.target.value);
              }}
              placeholder="Insert NFTs contract or wallet address"
            ></input>
            <div className={styles.select_container_alt}>
              <select
                onChange={(e) => {
                  setChain(e.target.value);
                }}
                defaultValue={Network.ETH_MAINNET}
              >
                <option value={"ETH_MAINNET"}>Mainnet</option>
                <option value={"MATIC_MUMBAI"}>Mumbai</option>
              </select>
            </div>
            <div onClick={() => fetchNFTs()} className={styles.button_black}>
              <a>Search</a>
            </div>
          </div>
        </div>
      </div>


      {isLoading ? (
        <div className={styles.loading_box}>
          <p>Loading...</p>
        </div>
      ) : (
        <div className={styles.nft_gallery}>
          {nfts?.length && fetchMethod != "collection" && (
            <div
              style={{
                display: "flex",
                gap: ".5rem",
                width: "100%",
                justifyContent: "end",
              }}
            >
              <p>Hide spam</p>
              <label className={styles.switch}>
                <input
                  onChange={(e) => setSpamFilter(e.target.checked)}
                  checked={spamFilter}
                  type="checkbox"
                />
                <span className={`${styles.slider} ${styles.round}`}></span>
              </label>
            </div>
          )}


					<div className={styles.nfts_display}>
						{nfts?.length ? (
							nfts.map((nft, index) => {
								return <NftCard key={index} nft={nft} />;
							})
						) : (
							<div className={styles.loading_box}>
								<p>No NFTs found for the selected address</p>
							</div>
						)}
					</div>
				</div>
			)}

      {pageKey && nfts?.length && (
        <div>
          <a
            className={styles.button_black}
            onClick={() => {
              fetchNFTs(pageKey);
            }}
          >
            Load more
          </a>
        </div>
      )}
    </div>
  );
}
