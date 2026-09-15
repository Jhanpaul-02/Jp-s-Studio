import { Sora } from 'next/font/google';
import NavBar from "../components/navbar";
import AboutMe from "../pages/aboutMe";

const sora = Sora({ subsets: ['latin'], weight: ['400','600','700'] });

export default function Home() {
  return (
    <>
      <NavBar />
      <AboutMe />
    </>
  );
}
