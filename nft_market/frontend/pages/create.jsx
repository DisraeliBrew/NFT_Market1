import NftCreator from "../components/nftCreator";
import { abi as MarketContractAbi } from '../../backend/artifacts/contracts/MarketContract.sol/MarketContract.json';

export default function create() {
    return ( <NftCreator contractAddress="0x2FD4cc38dDCA30Cc27dfb3abc235510e6aB6Ea9d" abi={MarketContractAbi} /> );
}
