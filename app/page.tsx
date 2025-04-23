'use client';

import { useState } from 'react';
import MonasteryTable from "../components/MonasteryTable";
import MonasteryMap from "../components/MonasteryMap";
import styles from "./page.module.css";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'map' | 'table'>('map');

  return (
    <div>
      <main className={styles.main}>
        <h1 className="text-3xl font-bold mb-6">Buddhist Monasteries Directory</h1>
        
        <div className="w-full mb-6">
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('map')}
                className={`${
                  activeTab === 'map'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Map View
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={`${
                  activeTab === 'table'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Table View
              </button>
            </nav>
          </div>

          {activeTab === 'map' && (
            <div className="w-full">
              <MonasteryMap />
            </div>
          )}
          
          {activeTab === 'table' && (
            <div className="w-full">
              <MonasteryTable />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
