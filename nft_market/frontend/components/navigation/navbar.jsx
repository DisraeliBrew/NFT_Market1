import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../../styles/Navbar.module.css";
import Link from 'next/link';
import Image from 'next/image';
export default function Navbar() {
	return (
		
		<nav className={styles.navbar}>
		<Image
			src="https://upload.wikimedia.org/wikipedia/commons/e/e5/Wisconsin_Badgers_logo.svg"
			alt="Logo"
			width={32}
			height={32}
		/>
		<ConnectButton></ConnectButton>
			<Link href = '/create'>Mint your NFT</Link>
			<Link href = '/'>Explore NFTs</Link>
			<Link href = '/marketplace'>Browse Marketplace</Link>
		</nav>
	);
}
