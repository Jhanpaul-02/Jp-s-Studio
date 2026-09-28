import type { Metadata } from "next";
import NavBar from "../../components/navbar";
import CompOfProjects from "../../pages/CompOfProjects";
import Footer from "../../pages/Footer";

export const metadata: Metadata = {
  title: "Projects | Jp's Studio",
  description: "Explore selected projects by Jp's Studio.",
};

export default function ProjectsPage() {
  return (
    <>
      <NavBar />
      <main>
        <CompOfProjects />
      </main>
      <Footer />
    </>
  );
}