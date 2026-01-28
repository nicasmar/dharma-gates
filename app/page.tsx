'use client';

import DirectoryContainer from "../components/DirectoryContainer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#286B88]/10 to-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#286B88] mb-3">Dharma Center Directory</h1>
          <p className="text-lg text-[#286B88]/80"><em>Find and explore Buddhist Centers around the world</em></p>
          <br></br>
          <p className="text-lg text-[#286B88]/80 white-text">
            Welcome to the BETA version of the Dharma Centers Directory!
            Our mission is to help make deep and authentic Buddhist practice accessible and flourishing. The Directory is
            a living, crowdsourced map and global directory of authentic Dharma practice. This is a
            bridge linking the many available teachers and centers with sincere seekers who may not know where or how to encounter deep practice.
          </p>
          <br></br>
          <p className="text-lg text-[#286B88]/80 white-text">
            The Directory connects people with quality Buddhist spaces and teachers
            — monasteries, retreat centers, temples, and sanghas — described with care and
            depth. Visitors can get a sense of centers’ daily life, explore photos, learn about
            the teachers, traditions, communities, and discover how to visit or engage.
          </p>
          <br></br>
          <p className="text-lg text-[#286B88]/80 white-text">
            Please enjoy and explore the site. We would love if you <em>Suggest a Center</em> or two (or more!) for our growing database. Please also <em>Give Feedback</em> on this growing project!
            Our vision is to become the most robust and impactful directory to connect people to sincere Buddhist practice.
          </p>
          <br></br>
          <p className="text-lg text-[#286B88]/80 white-text">
            Please also note The Directory is only currently styled for computer/desktop devices.
          </p>
        </div>
        <DirectoryContainer />
      </main>
    </div>
  );
}
