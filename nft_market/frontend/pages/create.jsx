import MarketContract from '../../backend/artifacts/contracts/MarketContract.sol/MarketContract.json';
import { useAccount } from 'wagmi';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Contract } from 'alchemy-sdk';
import styles from '../styles/NFTCreator.module.css';
import { ethers } from 'ethers';

const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_MATIC_KEY}`);
const owner = new ethers.Wallet(process.env.MARKET_OWNER_KEY, provider);

export default function create() {
  const { address, isDisconnected } = useAccount();
  const [txHash, setTxHash] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

  // Function to check if all required form fields are filled
  const formNotFilled = () => {
    return (
        !imageFile ||
        !name ||
        !description
    );
  };

  // Callback function for handling file drop
  const onDrop = useCallback((acceptedFiles) => {
    setImageFile(acceptedFiles[0]);
    setImageURL(URL.createObjectURL(acceptedFiles[0]));
  }, []);

  // Hook for handling file upload via drag and drop
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      "image/png": [".png", ".PNG"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    onDrop,
  });

  // Function for minting the NFT and generating metadata
  const mintNFT = async () => {
    if (formNotFilled()) {
      setError(true);
      return;
    }

    setError(false);
    setIsSubmitting(true);

    try {
      const NFTContract = new Contract(process.env.MARKET_ADDRESS, MarketContract.abi, owner);
      const id = ethers.utils.formatUnits(await NFTContract.getNextId(), 0);
      const metadataURL = await generateMetadata(id);
      const mintTx = await NFTContract.createToken(address, metadataURL, { gasLimit: 1000000 });
      setTxHash(mintTx.hash);
      await mintTx.wait();
    } catch (e) {
      console.log(e);
    }
    setIsSubmitting(false);
  };

  // Async function to generate metadata for the NFT
  const generateMetadata = async (id) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    const { fileURL } = await fetch("/api/pinFileToIpfs", {
      method: "POST",
      body: formData,
    }).then((res) => res.json());

    const metadata = {
      description: description,
      image: fileURL,
      name: name,
      price: '0',
      listing: false,
      owner: address,
      tokenId: id
    };

    const { metadataURL } = await fetch("/api/pinJsonToIpfs", {
      method: "POST",
      body: JSON.stringify(metadata),
    }).then((res) => res.json());

    return metadataURL;
  };

  return (
      // Main page container
      <div className={styles.page_flexBox}>
        <div
            // Check if transaction hash exists to change styling of container
            className={
              !txHash ? styles.page_container : styles.page_container_submitted
            }
        >
          <div className={styles.dropzone_container} {...getRootProps()}>
            <input {...getInputProps()}></input>
            {/* Check if an image is uploaded and display it */}
            {imageURL ? (
                <img
                    alt={"NFT Image"}
                    className={styles.nft_image}
                    src={imageURL}
                />
            ) : isDragActive ? (
                <p className="dropzone-content">Release to drop the files here </p>
            ) : (
                // Default dropzone content
                <div>
                  <p className={styles.dropzone_header}>
                    Drop your NFT art here, <br /> or{" "}
                    <span className={styles.dropzone_upload}>upload</span>
                  </p>
                  <p className={styles.dropzone_text}>Supports .jpg, .jpeg, .png</p>
                </div>
            )}
          </div>
          <div className={styles.inputs_container}>
            {/* Input field for NFT name */}
            <div className={styles.input_group}>
              <h3 className={styles.input_label}>NAME OF NFT</h3>
              {!txHash ? (
                  <input
                      className={styles.input}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      placeholder="NFT Title"
                  />
              ) : (
                  <p>{name}</p>
              )}
            </div>
            {/* Input field for NFT description */}
            <div className={styles.input_group}>
              <h3 className={styles.input_label}>DESCRIPTION</h3>
              {!txHash ? (
                  <input
                      className={styles.input}
                      onChange={(e) => setDescription(e.target.value)}
                      value={description}
                      placeholder="NFT Description"
                  />
              ) : (
                  <p>{description}</p>
              )}
            </div>
            <div>
              {isDisconnected ? (
                  <p>Connect your wallet to get started</p>
              ) : !txHash ? (
                  <div>
                    <button
                        className={
                          isSubmitting
                              ? styles.submit_button_submitting
                              : styles.submit_button
                        }
                        disabled={isSubmitting}
                        onClick={async () => await mintNFT()}
                    >
                      {isSubmitting ? "Minting NFT" : "Mint NFT"}
                    </button>
                    {error ? (
                        <p className={styles.error}>One or more fields is blank</p>
                    ) : null}
                  </div>
              ) : (
                  <div>
                    <h3 className={styles.attribute_input_label}>ADDRESS</h3>
                    <a
                        href={`https://mumbai.polygonscan.com/tx/${txHash}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                      <div className={styles.address_container}>
                        <div>
                          {txHash.slice(0, 6)}...{txHash.slice(6, 10)}
                        </div>
                        <img
                            src="https://static.alchemyapi.io/images/cw3d/Icon%20Large/etherscan-l.svg"
                            width="20px"
                            height="20px"
                        />
                      </div>
                    </a>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
