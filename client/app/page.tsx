import { Sora } from 'next/font/google';
import NavBar from "../components/navbar";
import First from '../pages/First'
import Skills from '../pages/mySkills'
import Projects from '../pages/myProjects';
import AboutMe from '../pages/AboutMe';
import ContactMe from '../pages/ContactMe';
import Footer from '../pages/Footer';

const sora = Sora({ subsets: ['latin'], weight: ['400','600','700'] });

export default function Home() {
  return (
    <>
      <NavBar />
      <First />
      <Skills/>
      <Projects/>
      <AboutMe/>
      <ContactMe/>
      <Footer/>
    </>
  );
}
