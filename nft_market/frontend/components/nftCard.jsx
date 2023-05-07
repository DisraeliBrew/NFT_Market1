import styles from '../styles/nftCard.module.css'
import { ethers } from 'ethers';
import { useAccount, useSigner } from 'wagmi';
import { useEffect, useState } from 'react';
import { Contract } from 'alchemy-sdk';
import MarketContract from '../../backend/artifacts/contracts/MarketContract.sol/MarketContract.json';
import { useRouter } from 'next/router';
import * as process from 'process';
import axios from 'axios';

export default function NftCard({ nft }) {
  const router = useRouter();
  const [metadata, setMetadata] = useState({});
  const [sellPrice, setSellPrice] = useState('');
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const isOurMarket = ethers.utils.getAddress(nft.contract.address) === (process.env.MARKET_ADDRESS);
  const isListing = metadata.listing;
  const isOwner = metadata.owner === address;
  const exDisabled = isOwner && isListing || !isOwner && !isListing;

  const handleClick = async () => {
    if (!isOwner && isListing) {
      // buy
      const metadataUrl = generateMetadata({
        ...metadata,
        listing: false,
        owner: address
      });
      const NFTContract = new Contract(process.env.MARKET_ADDRESS, MarketContract.abi, signer);
      const tx = await NFTContract.executeSale(
          metadata.tokenId,
          metadataUrl,
          { value: ethers.utils.parseEther(metadata.price), gasLimit: 1000000 }
      );
      await tx.wait();
      router.reload();
    } else if (isOwner && !isListing) {
      const metadataUrl = await generateMetadata({
        ...metadata,
        listing: true,
        price: sellPrice,
      });
      const NFTContract = new Contract(process.env.MARKET_ADDRESS, MarketContract.abi, signer);
      const pTx = await NFTContract.getListPrice();
      const listTx = await NFTContract.listToken(
          ethers.BigNumber.from(metadata.tokenId),
          metadataUrl,
          ethers.utils.parseEther(sellPrice),
          { value: pTx, gasLimit: 1000000 }
      );
      await listTx.wait();
      router.reload();
    }
  };

  const generateMetadata = async (metadata) => {
    console.log(metadata);
    const { metadataURL } = await fetch("/api/pinJsonToIpfs", {
      method: "POST",
      body: JSON.stringify(metadata),
    }).then((res) => res.json());
    return metadataURL;
  };

  useEffect(() => {
    const f = async () => {
      if (isOurMarket && signer) {
        const NFTContract = new Contract(process.env.MARKET_ADDRESS, MarketContract.abi, signer);
        const id = ethers.BigNumber.from(nft.id.tokenId);
        const tokenUri = await NFTContract.tokenURI(id);
        console.log(tokenUri);
        const res = await axios.get(tokenUri);
        const data = await res.data;
        setMetadata(data);
      }
    };
    f();
  }, [signer]);

  useEffect(() => {
    console.log(metadata);
  }, [metadata]);

  return (
      <div className={styles.card_container}>
        <div className={styles.image_container}>
          {nft.format == "mp4" ? (
              <video src={nft.media} controls>
                Your browser does not support the video tag.
              </video>
          ) : (
              <img src={nft.media[0]['gateway']}></img>
          )}
        </div>
        <div className={styles.info_container}>
          <div className={styles.title_container}>
            <h3>{nft.title}</h3>
          </div>
          <div className={styles.description_container}>
            <p>{nft.description}</p>
          </div>
          <hr className={styles.separator} />
          <div className={styles.symbol_contract_container}>
            <div className={styles.symbol_container}>
              <p>{nft.symbol}</p>

              {nft.verified === "verified" ? (
                  <img
                      src={
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Twitter_Verified_Badge.svg/2048px-Twitter_Verified_Badge.svg.png"
                      }
                      width="20px"
                      height="20px"
                  />
              ) : null}
            </div>
            <a
                className={styles.contract_container}
                href={`https://mumbai.polygonscan.com/token/${nft['contract']['address']}`}
                target="_blank"
            >
              <img
                  src={
                    "https://etherscan.io/images/brandassets/etherscan-logo-circle.svg"
                  }
                  width="15px"
                  height="15px"
              />
              <p className={styles.contract_container}>
                {nft['contract']['address'].slice(0, 6)}...{nft['contract']['address'].slice(6, 10)}
              </p>
            </a>
          </div>

          <div className={styles.exchanges_container}>
            {!isOurMarket ? (
                <>Token is not from our market</>
            ) : (
              <>
                {isOwner && !isListing && (
                    <input
                        type="number"
                        placeholder="ETH"
                        value={sellPrice}
                        onChange={e => setSellPrice(e.target.value)}
                    />
                )}
                <button className={styles.exchanges_button} disabled={exDisabled} onClick={handleClick}>
                  {!isOwner ? exDisabled ? (
                      <>Not for sale</>
                  ) : (
                      <>Buy {metadata.price} ETH</>
                  ) : exDisabled ? (
                      <>Listing {metadata.price} ETH</>
                  ) : (
                      <>Sell</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
  );
}