import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import MatchResultForm from './components/MatchResultForm';
import AppsScriptService from './services/googleSheets';

// Updated Apps Script web app URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykykylOeRhdfhgnZ7rK-COdZwz8CD7eYL22UcO4xt3wvbTY8aXzSL1zfd0va9HdIw9Xw/exec';

const sheetsService = new AppsScriptService(APPS_SCRIPT_URL);

interface MatchResult {
  id?: string;
  player: string;
  opponent: string;
  format: string;
  playerDeck: string;
  opponentDeck: string;
  games: string;
  playDraw?: string;
  sideboardStatus?: string;
  date?: string;
}

const App: React.FC = () => {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Extract unique values for shared dropdowns - with safety checks
  const uniquePlayers = [...new Set([
    ...(Array.isArray(results) ? results.map(r => r.player) : []),
    ...(Array.isArray(results) ? results.map(r => r.opponent) : [])
  ].filter(Boolean))].sort();
  
  const uniqueDecks = [...new Set([
    ...(Array.isArray(results) ? results.map(r => r.playerDeck) : []),
    ...(Array.isArray(results) ? results.map(r => r.opponentDeck) : [])
  ].filter(Boolean))].sort();

  const loadResults = async () => {
    try {
      console.log('Loading results from Google Sheets...');
      const data: any = await sheetsService.getData();
      console.log('Raw data from sheets:', data);
      console.log('Type of data:', typeof data);
      console.log('Is array?', Array.isArray(data));
      
      // Ensure we always set an array
      if (Array.isArray(data)) {
        setResults(data);
      } else if (data && data.data && Array.isArray(data.data)) {
        setResults(data.data);
      } else {
        console.warn('Data is not in expected format, setting empty array');
        setResults([]);
      }
    } catch (error) {
      console.error('Error loading results:', error);
      setResults([]); // Ensure we set an empty array on error
      toast.error('Failed to load results');
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
        await loadResults(); // Reload results
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
    loadResults();
  }, []);

  // Debug info - you can remove this later
  console.log('Unique players:', uniquePlayers);
  console.log('Unique decks:', uniqueDecks);
  console.log('Total results:', results.length);

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
            players={uniquePlayers}
            decks={uniqueDecks}
          />
        </div>
      </div>
    </div>
  );
};

export default App;