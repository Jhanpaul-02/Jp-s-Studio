import { Sora } from 'next/font/google';
import NavBar from "../components/navbar";
import First from '../pages/First'
import Skills from '../pages/mySkills'

const sora = Sora({ subsets: ['latin'], weight: ['400','600','700'] });

export default function Home() {
  return (
    <>
      <NavBar />
      <First />
      <Skills/>
    </>
  );
}
