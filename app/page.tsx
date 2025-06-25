'use client';

import DirectoryContainer from "../components/DirectoryContainer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#286B88]/10 to-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#286B88] mb-3">Buddhist Centers Directory</h1>
          <p className="text-lg text-[#286B88]/80">Find and explore Buddhist Centers around the world</p>
        </div>
        <DirectoryContainer />
      </main>
    </div>
  );
}
