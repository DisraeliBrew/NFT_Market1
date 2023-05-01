import styles from "../styles/Home.module.css";
import InstructionsComponent from "../components/InstructionsComponent";
import NFTGallery from "../components/nftGallery";

export default function Home() {
  return (
    <div>
      <main className={styles.main}>
        <NFTGallery> </NFTGallery>
      </main>
    </div>
  );
}
