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
const [request,setRequest] = useState("getNftsForOwner");
  const settings = {
    apiKey: "demo", // Replace with your Alchemy API Key.
    network: Network.ETH_MAINNET, // Replace with your network.
  };

  const alchemy = new Alchemy(settings);
  const changeFetchMethod = (e) => {
    setNfts()
    setPageKey()
    switch (e.target.value) {
      case "wallet":
        setWalletOrCollectionAddress("vitalik.eth");

        break;
      case "collection":
        setWalletOrCollectionAddress(
          "0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e"
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
    //   const res = await fetch(endpoint, {
    //     method: "POST",
    //     body: JSON.stringify({
    //       address:
    //         fetchMethod == "connectedWallet"
    //           ? address
    //           : walletOrCollectionAddress,
    //       pageKey: pagekey ? pagekey : null,
    //       chain: chain,
    //       excludeFilter: spamFilter,
    //     }),
    //   }).then((res) => res.json());
    console.log(reqOptions);
    var requestOptions = {
        method: 'GET'
      };
    // const api_key ="lgwXa7iMrjuK7hJOl_S6Wwga7AzExdxZ"
    // const baseURL = `https://eth-mainnet.g.alchemy.com/v2/${api_key}/${request}/`;
    // const fetchURL = `${baseURL}?contractAddress=${walletOrCollectionAddress}&withMetadata=${"true"}`;
    // const nfts = await fetch(fetchURL,requestOptions).then(data => data.json())
        const api_key = "lgwXa7iMrjuK7hJOl_S6Wwga7AzExdxZ"
    // const baseURL = `https://eth-mainnet.g.alchemy.com/v2/${api_key}/"getNftsForCollection/`;
    // const fetchURL = `${baseURL}?$contractAddress=${walletOrCollectionAddress}&withMetadata=${"true"}`;
    // const res = await fetch(fetchURL, requestOptions).then(data => data.json())
    const baseURL = `https://eth-mainnet.g.alchemy.com/v2/${api_key}/${request}/`;
    const fetchURL = `${baseURL}?${reqOptions}=${walletOrCollectionAddress}&withMetadata=${"true"}`;
    const res = await fetch(fetchURL, requestOptions).then(data => data.json())

      console.log(res);
      if (nfts?.length && pageKey) {
        setNfts((prevState) => [...prevState, ...res.nfts]);
      } else {
        setNfts();
        setNfts(res.nfts);
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
                defaultValue={process.env.ALCHEMY_NETWORK}
              >
                <option value={"ETH_MAINNET"}>Mainnet</option>
                <option value={"MATIC_MAINNET"}>Polygon</option>
                <option value={"ETH_GOERLI"}>Goerli</option>
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
