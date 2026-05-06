import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import MatchResultForm from './components/MatchResultForm';
import AppsScriptService from './services/googleSheets';

// Updated Apps Script web app URL
<<<<<<< HEAD
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQZd4CbBtJL5HQdL0ihRjUuqfuZEjoFFz-2hgvIxO6-Oei1y3KPuIRGq7RmkvZFVfBQg/exec';
=======
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxokl9pnqhVld9jMbtUrjxOtyGE7c81zUwHIA5UlWTErsyFViIwei3SrAWNp2Y776hCw/exec';
>>>>>>> cb53084 (point to pt amsterdam sheet)

const sheetsService = new AppsScriptService(APPS_SCRIPT_URL);

interface MatchResult {
  id?: string;
  player: string;
  opponent: string;
  format: string;
  playerDeck: string;
  opponentDeck: string;
  games: string;
  sideboardStatus?: string;
  mainColors?: string;
  splashColors?: string;
  wins?: number;
  losses?: number;
  draftType?: string;
  sheetTab?: string;
}

const App: React.FC = () => {
  const [players, setPlayers] = useState<string[]>([]);
  const [opponents, setOpponents] = useState<string[]>([]);
  const [decks, setDecks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDropdownData = async () => {
    try {
      console.log('Loading dropdown data from Google Sheets...');
      const data: any = await sheetsService.getData();
      
      if (data.success) {
        setPlayers(data.players || []);
        setOpponents(data.opponents || []);
        setDecks(data.decks || []);
        console.log('Loaded players:', data.players);
        console.log('Loaded opponents:', data.opponents);
        console.log('Loaded decks:', data.decks);
      }
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  const handleSubmitResult = async (data: MatchResult) => {
    setIsLoading(true);
    console.log('Submitting data:', data);
    console.log('Using Apps Script URL:', APPS_SCRIPT_URL);
    
    try {
      const success = await sheetsService.appendData(data);
      console.log('Append result:', success);
      
      if (success) {
        toast.success('Match result saved successfully!');
      } else {
        toast.error('Failed to save match result - check console for details');
      }
    } catch (error: any) {
      console.error('Error saving result:', error);
      toast.error(`Failed to save: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDropdownData();
  }, []);

  console.log('Players:', players);
  console.log('Opponents:', opponents);
  console.log('Decks:', decks);

  return (
    <div className="min-h-screen" style={{backgroundColor: '#1a202c'}}>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#2d3748',
            color: '#ffffff',
            border: '1px solid #4a5568'
          }
        }}
      />
      
      {/* Header */}
      <div className="bg-blue-600 px-4 py-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-semibold text-white text-center">
            MTG Pro Testing
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div style={{backgroundColor: '#1a202c', minHeight: '100vh'}}>
        <div className="max-w-md mx-auto px-4 py-6">
          <MatchResultForm 
            onSubmit={handleSubmitResult} 
            isLoading={isLoading}
            players={players}
            opponents={opponents}
            decks={decks}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
