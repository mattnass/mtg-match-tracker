import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define the interface directly here to avoid import issues
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

const matchResultSchema = z.object({
  player: z.string().min(1, 'Player name is required'),
  opponent: z.string().min(1, 'Opponent name is required'),
  format: z.string().min(1, 'Format is required'),
  playerDeck: z.string().min(1, 'Player deck is required'),
  opponentDeck: z.string().min(1, 'Opponent deck is required'),
  wins: z.number().min(0, 'Wins must be 0 or greater'),
  losses: z.number().min(0, 'Losses must be 0 or greater'),
  playDraw: z.string().optional(),
  sideboardStatus: z.string().optional()
});

type MatchResultForm = z.infer<typeof matchResultSchema>;

interface MatchResultFormProps {
  onSubmit: (data: MatchResult) => Promise<void>;
  isLoading: boolean;
  players?: string[];
  decks?: string[];
}

const MatchResultForm: React.FC<MatchResultFormProps> = ({ 
  onSubmit, 
  isLoading, 
  players = [], 
  decks = [] 
}) => {
  const [showCustomPlayer, setShowCustomPlayer] = useState(false);
  const [showCustomOpponent, setShowCustomOpponent] = useState(false);
  const [showCustomPlayerDeck, setShowCustomPlayerDeck] = useState(false);
  const [showCustomOpponentDeck, setShowCustomOpponentDeck] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<MatchResultForm>({
    resolver: zodResolver(matchResultSchema),
    defaultValues: {
      wins: 0,
      losses: 0,
      playDraw: '',
      sideboardStatus: ''
    }
  });

  const handleFormSubmit = async (data: MatchResultForm) => {
    // Convert empty strings to undefined for optional fields
    const matchResult: MatchResult = {
      player: data.player,
      opponent: data.opponent,
      format: data.format,
      playerDeck: data.playerDeck,
      opponentDeck: data.opponentDeck,
      games: `${data.wins}-${data.losses}`,
      playDraw: data.playDraw && data.playDraw.trim() !== '' ? data.playDraw : undefined,
      sideboardStatus: data.sideboardStatus && data.sideboardStatus.trim() !== '' ? data.sideboardStatus : undefined,
      date: new Date().toISOString().split('T')[0]
    };
    
    console.log('Form data before submission:', matchResult);
    
    await onSubmit(matchResult);
    reset();
    setValue('wins', 0);
    setValue('losses', 0);
    setValue('playDraw', '');
    setValue('sideboardStatus', '');
    // Reset custom field states
    setShowCustomPlayer(false);
    setShowCustomOpponent(false);
    setShowCustomPlayerDeck(false);
    setShowCustomOpponentDeck(false);
  };

  // Shared styles with increased height and padding
  const labelClass = "block text-white font-medium mb-3 text-lg";
  const inputClass = "w-full rounded-lg px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg border-0" 
    + " " + "bg-gray-700 h-14";
  const selectClass = "w-full rounded-lg px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg appearance-none border-0"
    + " " + "bg-gray-700 h-14";
  const addButtonClass = "w-full mt-2 py-2 px-4 bg-slate-600 hover:bg-slate-500 text-blue-400 rounded-lg text-sm font-medium transition-colors";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-12">
      {/* Row 1: Your Name and Opponent - FORCED SIDE BY SIDE */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem'}}>
        <div>
          <label className={labelClass}>Your Name</label>
          {!showCustomPlayer && players.length > 0 ? (
            <div>
              <select {...register('player')} className={selectClass} style={{backgroundColor: '#374151'}}>
                <option value="" style={{backgroundColor: '#374151', color: '#9ca3af'}}>Select player...</option>
                {players.map(player => (
                  <option key={player} value={player} style={{backgroundColor: '#374151', color: '#ffffff'}}>{player}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCustomPlayer(true)}
                className={addButtonClass}
              >
                + Add New Name
              </button>
            </div>
          ) : (
            <div>
              <input
                {...register('player')}
                type="text"
                className={inputClass}
                style={{backgroundColor: '#374151'}}
                placeholder="Your name"
              />
              {players.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCustomPlayer(false)}
                  className={addButtonClass}
                >
                  Use Dropdown
                </button>
              )}
            </div>
          )}
          {errors.player && (
            <p className="text-red-400 text-sm mt-1">{errors.player.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Opponent</label>
          {!showCustomOpponent && players.length > 0 ? (
            <div>
              <select {...register('opponent')} className={selectClass} style={{backgroundColor: '#374151'}}>
                <option value="" style={{backgroundColor: '#374151', color: '#9ca3af'}}>Select opponent...</option>
                {players.map(player => (
                  <option key={player} value={player} style={{backgroundColor: '#374151', color: '#ffffff'}}>{player}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCustomOpponent(true)}
                className={addButtonClass}
              >
                + Add New Name
              </button>
            </div>
          ) : (
            <div>
              <input
                {...register('opponent')}
                type="text"
                className={inputClass}
                style={{backgroundColor: '#374151'}}
                placeholder="Opponent name"
              />
              {players.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCustomOpponent(false)}
                  className={addButtonClass}
                >
                  Use Dropdown
                </button>
              )}
            </div>
          )}
          {errors.opponent && (
            <p className="text-red-400 text-sm mt-1">{errors.opponent.message}</p>
          )}
        </div>
      </div>

      {/* Row 2: Format - FULL WIDTH */}
      <div style={{marginBottom: '3rem'}}>
        <label className={labelClass}>Format</label>
        <select {...register('format')} className={selectClass} style={{backgroundColor: '#374151'}}>
          <option value="" style={{backgroundColor: '#374151', color: '#9ca3af'}}>Select format...</option>
          <option value="Standard" style={{backgroundColor: '#374151', color: '#ffffff'}}>Standard</option>
          <option value="Pioneer" style={{backgroundColor: '#374151', color: '#ffffff'}}>Pioneer</option>
          <option value="Modern" style={{backgroundColor: '#374151', color: '#ffffff'}}>Modern</option>
          <option value="Legacy" style={{backgroundColor: '#374151', color: '#ffffff'}}>Legacy</option>
          <option value="Vintage" style={{backgroundColor: '#374151', color: '#ffffff'}}>Vintage</option>
          <option value="Commander" style={{backgroundColor: '#374151', color: '#ffffff'}}>Commander</option>
          <option value="Limited" style={{backgroundColor: '#374151', color: '#ffffff'}}>Limited</option>
          <option value="Draft" style={{backgroundColor: '#374151', color: '#ffffff'}}>Draft</option>
          <option value="Sealed" style={{backgroundColor: '#374151', color: '#ffffff'}}>Sealed</option>
          <option value="Pauper" style={{backgroundColor: '#374151', color: '#ffffff'}}>Pauper</option>
        </select>
        {errors.format && (
          <p className="text-red-400 text-sm mt-1">{errors.format.message}</p>
        )}
      </div>

      {/* Row 3: Your Deck and Opponent's Deck - FORCED SIDE BY SIDE */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem'}}>
        <div>
          <label className={labelClass}>Your Deck</label>
          {!showCustomPlayerDeck && decks.length > 0 ? (
            <div>
              <select {...register('playerDeck')} className={selectClass} style={{backgroundColor: '#374151'}}>
                <option value="" style={{backgroundColor: '#374151', color: '#9ca3af'}}>Select deck...</option>
                {decks.map(deck => (
                  <option key={deck} value={deck} style={{backgroundColor: '#374151', color: '#ffffff'}}>{deck}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCustomPlayerDeck(true)}
                className={addButtonClass}
              >
                + Add New Deck
              </button>
            </div>
          ) : (
            <div>
              <input
                {...register('playerDeck')}
                type="text"
                className={inputClass}
                style={{backgroundColor: '#374151'}}
                placeholder="Deck name"
              />
              {decks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCustomPlayerDeck(false)}
                  className={addButtonClass}
                >
                  Use Dropdown
                </button>
              )}
            </div>
          )}
          {errors.playerDeck && (
            <p className="text-red-400 text-sm mt-1">{errors.playerDeck.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Opp Deck</label>
          {!showCustomOpponentDeck && decks.length > 0 ? (
            <div>
              <select {...register('opponentDeck')} className={selectClass} style={{backgroundColor: '#374151'}}>
                <option value="" style={{backgroundColor: '#374151', color: '#9ca3af'}}>Select deck...</option>
                {decks.map(deck => (
                  <option key={deck} value={deck} style={{backgroundColor: '#374151', color: '#ffffff'}}>{deck}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCustomOpponentDeck(true)}
                className={addButtonClass}
              >
                + Add New Deck
              </button>
            </div>
          ) : (
            <div>
              <input
                {...register('opponentDeck')}
                type="text"
                className={inputClass}
                style={{backgroundColor: '#374151'}}
                placeholder="Opponent deck"
              />
              {decks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCustomOpponentDeck(false)}
                  className={addButtonClass}
                >
                  Use Dropdown
                </button>
              )}
            </div>
          )}
          {errors.opponentDeck && (
            <p className="text-red-400 text-sm mt-1">{errors.opponentDeck.message}</p>
          )}
        </div>
      </div>

      {/* Row 4: Game Score and Options */}
      <div style={{marginBottom: '3rem'}}>
        <label className={labelClass}>Games</label>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem'}}>
          <input
            {...register('wins', { valueAsNumber: true })}
            type="number"
            min="0"
            className={`${inputClass} text-center`}
            style={{backgroundColor: '#374151'}}
            placeholder="Wins"
          />
          <input
            {...register('losses', { valueAsNumber: true })}
            type="number"
            min="0"
            className={`${inputClass} text-center`}
            style={{backgroundColor: '#374151'}}
            placeholder="Losses"
          />
        </div>
        {(errors.wins || errors.losses) && (
          <p className="text-red-400 text-sm mt-1">
            {errors.wins?.message || errors.losses?.message}
          </p>
        )}
        
        {/* Optional dropdowns */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
          <div>
            <label className="block text-white font-medium mb-2 text-sm">Play/Draw</label>
            <select {...register('playDraw')} className={selectClass} style={{backgroundColor: '#374151', height: '3.5rem', fontSize: '16px', padding: '0.75rem'}}>
              <option value="" style={{backgroundColor: '#374151', color: '#9ca3af'}}>Select...</option>
              <option value="Play" style={{backgroundColor: '#374151', color: '#ffffff'}}>On the Play</option>
              <option value="Draw" style={{backgroundColor: '#374151', color: '#ffffff'}}>On the Draw</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white font-medium mb-2 text-sm">Sideboard</label>
            <select {...register('sideboardStatus')} className={selectClass} style={{backgroundColor: '#374151', height: '3.5rem', fontSize: '16px', padding: '0.75rem'}}>
              <option value="" style={{backgroundColor: '#374151', color: '#9ca3af'}}>Select...</option>
              <option value="Pre-Sideboard" style={{backgroundColor: '#374151', color: '#ffffff'}}>Pre-Sideboard</option>
              <option value="Post-Sideboard" style={{backgroundColor: '#374151', color: '#ffffff'}}>Post-Sideboard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Row 5: Submit Button - FULL WIDTH */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
        style={{padding: '1rem', height: '3.5rem'}}
      >
        {isLoading ? 'Saving...' : 'Save Match to Google Sheets'}
      </button>
    </form>
  );
};

export default MatchResultForm;