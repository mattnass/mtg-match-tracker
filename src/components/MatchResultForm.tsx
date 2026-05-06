import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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

interface GameDetail {
  gameNumber: number;
  result: 'W' | 'L' | '';
  sideboard: 'Pre' | 'Post' | '';
}

interface MatchDetail {
  matchNumber: number;
  playerScore: number;
  opponentScore: number;
  sideboardType: 'Pre' | 'Post';
}

interface LastEntries {
  player: string;
  opponent: string;
  format: string;
  playerDeck: string;
  opponentDeck: string;
  draftType?: string;
}

const matchResultSchema = z.object({
  player: z.string().min(1, 'Player name is required'),
  opponent: z.string().min(1, 'Opponent name is required'),
  format: z.string().min(1, 'Format is required'),
  playerDeck: z.string().min(1, 'Player deck is required'),
  opponentDeck: z.string().min(1, 'Opponent deck is required'),
});

const draftResultSchema = z.object({
  player: z.string().min(1, 'Player name is required'),
  format: z.string().min(1, 'Format is required'),
  mainColors: z.string().min(1, 'Main colors are required'),
  splashColors: z.string().optional(),
  wins: z.number().min(0, 'Wins must be 0 or greater'),
  losses: z.number().min(0, 'Losses must be 0 or greater'),
  draftType: z.string().min(1, 'Draft type is required'),
});

type MatchResultForm = z.infer<typeof matchResultSchema>;
type DraftResultForm = z.infer<typeof draftResultSchema>;

interface MatchResultFormProps {
  onSubmit: (data: MatchResult) => Promise<void>;
  isLoading: boolean;
  players?: string[];
  opponents?: string[];
  decks?: string[];
}

const MatchResultForm: React.FC<MatchResultFormProps> = ({ 
  onSubmit, 
  isLoading, 
  players = [], 
  opponents = [],
  decks = [] 
}) => {
  const [showCustomPlayer, setShowCustomPlayer] = useState(false);
  const [showCustomOpponent, setShowCustomOpponent] = useState(false);
  const [numGames, setNumGames] = useState(3);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [gameDetails, setGameDetails] = useState<GameDetail[]>(
    Array.from({ length: 3 }, (_, i) => ({
      gameNumber: i + 1,
      result: '' as 'W' | 'L' | '',
      sideboard: '' as 'Pre' | 'Post' | ''
    }))
  );
  const [matchDetails, setMatchDetails] = useState<MatchDetail[]>([
    {
      matchNumber: 1,
      playerScore: 0,
      opponentScore: 0,
      sideboardType: 'Pre'
    },
    {
      matchNumber: 2,
      playerScore: 0,
      opponentScore: 0,
      sideboardType: 'Post'
    }
  ]);

  const loadLastEntries = (): LastEntries | null => {
    try {
      const saved = localStorage.getItem('mtg-last-entries');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const saveLastEntries = (entries: LastEntries) => {
    try {
      localStorage.setItem('mtg-last-entries', JSON.stringify(entries));
    } catch {
      // Silently fail if localStorage isn't available
    }
  };

  const {
    register: registerMatch,
    handleSubmit: handleSubmitMatch,
    setValue: setValueMatch,
    watch: watchMatch,
    formState: { errors: errorsMatch }
  } = useForm<MatchResultForm>({
    resolver: zodResolver(matchResultSchema),
  });

  const {
    register: registerDraft,
    handleSubmit: handleSubmitDraft,
    reset: resetDraft,
    setValue: setValueDraft,
    watch: watchDraft,
    formState: { errors: errorsDraft }
  } = useForm<DraftResultForm>({
    resolver: zodResolver(draftResultSchema)
  });

  const watchedMatchFormat = watchMatch('format');
  const watchedDraftFormat = watchDraft('format');

  useEffect(() => {
    const currentIsDraft = selectedFormat === 'Draft' || selectedFormat === 'Limited';
    
    if (currentIsDraft) {
      if (watchedDraftFormat && watchedDraftFormat !== selectedFormat) {
        setSelectedFormat(watchedDraftFormat);
      }
    } else {
      if (watchedMatchFormat && watchedMatchFormat !== selectedFormat) {
        setSelectedFormat(watchedMatchFormat);
      }
    }
  }, [watchedMatchFormat, watchedDraftFormat, selectedFormat]);

  const handleFormatChange = (newFormat: string) => {
    setSelectedFormat(newFormat);
    setValueMatch('format', newFormat);
    setValueDraft('format', newFormat);
  };

  useEffect(() => {
    const lastEntries = loadLastEntries();
    if (lastEntries) {
      setValueMatch('player', lastEntries.player);
      setValueMatch('opponent', lastEntries.opponent);
      setValueMatch('format', lastEntries.format);
      setValueMatch('playerDeck', lastEntries.playerDeck);
      setValueMatch('opponentDeck', lastEntries.opponentDeck);
      
      setValueDraft('player', lastEntries.player);
      setValueDraft('format', lastEntries.format);
      if (lastEntries.draftType) {
        setValueDraft('draftType', lastEntries.draftType);
      }
      
      setSelectedFormat(lastEntries.format);
    }
  }, [setValueMatch, setValueDraft]);

  const updateGameDetail = (gameIndex: number, field: keyof GameDetail, value: any) => {
    const newGameDetails = [...gameDetails];
    newGameDetails[gameIndex] = { ...newGameDetails[gameIndex], [field]: value };
    
    if (field === 'result') {
      if (gameIndex === 0) {
        newGameDetails[gameIndex].sideboard = 'Pre';
      } else {
        newGameDetails[gameIndex].sideboard = 'Post';
      }
    }
    
    setGameDetails(newGameDetails);
  };

  const addGame = () => {
    if (numGames < 5) {
      const newNumGames = numGames + 1;
      setNumGames(newNumGames);
      setGameDetails([...gameDetails, {
        gameNumber: newNumGames,
        result: '' as 'W' | 'L' | '',
        sideboard: '' as 'Pre' | 'Post' | ''
      }]);
    }
  };

  const removeGame = () => {
    if (numGames > 1) {
      const newNumGames = numGames - 1;
      setNumGames(newNumGames);
      setGameDetails(gameDetails.slice(0, newNumGames));
    }
  };

  const calculateScore = () => {
    const wins = gameDetails.filter(game => game.result === 'W').length;
    const losses = gameDetails.filter(game => game.result === 'L').length;
    return `${wins}-${losses}`;
  };

  const handleMatchSubmit = async (data: MatchResultForm) => {
    saveLastEntries({
      player: data.player,
      opponent: data.opponent,
      format: data.format,
      playerDeck: data.playerDeck,
      opponentDeck: data.opponentDeck,
    });

    if (selectedFormat === 'Constructed In House') {
      const completedMatches = matchDetails.filter(match => 
        match.playerScore > 0 || match.opponentScore > 0
      );
      
      if (completedMatches.length === 0) {
        alert('Please enter scores for at least one match');
        return;
      }

      try {
        for (const match of completedMatches) {
          const sideboardStatus = match.sideboardType === 'Pre' ? 'Pre-Sideboard' : 'Post-Sideboard';
          await onSubmit({
            player: data.player,
            opponent: data.opponent,
            format: data.format,
            playerDeck: data.playerDeck,
            opponentDeck: data.opponentDeck,
            games: `${match.playerScore}-${match.opponentScore}`,
            sideboardStatus,
          });
        }
        
        setMatchDetails([
          {
            matchNumber: 1,
            playerScore: 0,
            opponentScore: 0,
            sideboardType: 'Pre'
          },
          {
            matchNumber: 2,
            playerScore: 0,
            opponentScore: 0,
            sideboardType: 'Post'
          }
        ]);
      } catch (error) {
        console.error('Failed to submit match result:', error);
        alert('Failed to save match result. Please try again.');
      }
    } else {
      const completedGames = gameDetails.filter(game => game.result !== '');
      
      if (completedGames.length === 0) {
        alert('Please select results for at least one game');
        return;
      }

      try {
        const preGames = completedGames.filter(game => game.sideboard === 'Pre');
        const postGames = completedGames.filter(game => game.sideboard === 'Post');

        if (preGames.length > 0) {
          const preWins = preGames.filter(g => g.result === 'W').length;
          const preLosses = preGames.filter(g => g.result === 'L').length;
          await onSubmit({
            player: data.player,
            opponent: data.opponent,
            format: data.format,
            playerDeck: data.playerDeck,
            opponentDeck: data.opponentDeck,
            games: `${preWins}-${preLosses}`,
            sideboardStatus: 'Pre-Sideboard',
          });
        }

        if (postGames.length > 0) {
          const postWins = postGames.filter(g => g.result === 'W').length;
          const postLosses = postGames.filter(g => g.result === 'L').length;
          await onSubmit({
            player: data.player,
            opponent: data.opponent,
            format: data.format,
            playerDeck: data.playerDeck,
            opponentDeck: data.opponentDeck,
            games: `${postWins}-${postLosses}`,
            sideboardStatus: 'Post-Sideboard',
          });
        }
        
        setGameDetails(Array.from({ length: 3 }, (_, i) => ({
          gameNumber: i + 1,
          result: '' as 'W' | 'L' | '',
          sideboard: '' as 'Pre' | 'Post' | ''
        })));
        setNumGames(3);
      } catch (error) {
        console.error('Failed to submit match result:', error);
        alert('Failed to save match result. Please try again.');
      }
    }
  };

  const handleDraftSubmit = async (data: DraftResultForm) => {
    if (!data.mainColors) {
      alert('Please select main colors');
      return;
    }
    
    if (!data.draftType) {
      alert('Please select draft type');
      return;
    }
    
    if (data.wins === undefined || data.losses === undefined) {
      alert('Please enter wins and losses');
      return;
    }

    saveLastEntries({
      player: data.player,
      opponent: 'Various',
      format: data.format,
      playerDeck: `${data.mainColors}${data.splashColors ? ` splash ${data.splashColors}` : ''}`,
      opponentDeck: 'Various',
      draftType: data.draftType,
    });

    const draftResult: MatchResult = {
      player: data.player,
      opponent: 'Various',
      format: data.format,
      playerDeck: `${data.mainColors}${data.splashColors ? ` splash ${data.splashColors}` : ''}`,
      opponentDeck: 'Various',
      games: `${data.wins}-${data.losses}`,
      mainColors: data.mainColors,
      splashColors: data.splashColors || '',
      wins: data.wins,
      losses: data.losses,
      draftType: data.draftType,
      sheetTab: 'Draft'
    };
    
    try {
      await onSubmit(draftResult);
      
      const savedPlayer = data.player;
      const savedFormat = data.format;
      const savedDraftType = data.draftType;
      
      resetDraft();
      setValueDraft('player', savedPlayer);
      setValueDraft('format', savedFormat);
      setValueDraft('draftType', savedDraftType);
    } catch (error) {
      console.error('Failed to submit draft result:', error);
      alert('Failed to save draft result. Please try again.');
    }
  };

  const isDraftFormat = selectedFormat === 'Draft' || selectedFormat === 'Limited';
  const isConstructedInHouse = selectedFormat === 'Constructed In House';

  const labelClass = "block text-white font-medium mb-3 text-lg";
  const inputClass = "w-full rounded-lg px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg border-0 bg-gray-700 h-14";
  const selectClass = "w-full rounded-lg px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg appearance-none border-0 bg-gray-700 h-14";
  const addButtonClass = "w-full mt-2 py-2 px-4 bg-slate-600 hover:bg-slate-500 text-blue-400 rounded-lg text-sm font-medium transition-colors";

  return (
    <>
      <style>
        {`
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}
      </style>
      <form onSubmit={isDraftFormat ? handleSubmitDraft(handleDraftSubmit) : handleSubmitMatch(handleMatchSubmit)} className="space-y-8">
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem'}}>
        <div>
          <label className={labelClass}>Your Name</label>
          {!showCustomPlayer && players.length > 0 ? (
            <div>
              <select {...(isDraftFormat ? registerDraft('player') : registerMatch('player'))} className={selectClass} style={{backgroundColor: '#374151'}}>
                <option value="" style={{backgroundColor: '#374151', color: '#9ca3af'}}>Select player...</option>
                {players.map(player => (
                  <option key={player} value={player} style={{backgroundColor: '#374151', color: '#ffffff'}}>{player}</option>
                ))}
              </select>
              <button type="button" onClick={() => setShowCustomPlayer(true)} className={addButtonClass}>
                + Add New Name
              </button>
            </div>
          ) : (
            <div>
              <input {...(isDraftFormat ? registerDraft('player') : registerMatch('player'))} type="text" className={inputClass} style={{backgroundColor: '#374151'}} placeholder="Your name" />
              {players.length > 0 && (
                <button type="button" onClick={() => setShowCustomPlayer(false)} className={addButtonClass}>
                  Use Dropdown
                </button>
              )}
            </div>
          )}
          {(isDraftFormat ? errorsDraft.player : errorsMatch.player) && (
            <p className="text-red-400 text-sm mt-1">{(isDraftFormat ? errorsDraft.player : errorsMatch.player)?.message}</p>
          )}
        </div>

        {!isDraftFormat ? (
          <div>
            <label className={labelClass}>Opponent</label>
            {!showCustomOpponent && opponents.length > 0 ? (
              <div>
                <select {...registerMatch('opponent')} className={selectClass} style={{backgroundColor: '#374151'}}>
                  <option value="" style={{backgroundColor: '#374151', color: '#9ca3af'}}>Select opponent...</option>
                  {opponents.map(opponent => (
                    <option key={opponent} value={opponent} style={{backgroundColor: '#374151', color: '#ffffff'}}>{opponent}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setShowCustomOpponent(true)} className={addButtonClass}>
                  + Add New Name
                </button>
              </div>
            ) : (
              <div>
                <input {...registerMatch('opponent')} type="text" className={inputClass} style={{backgroundColor: '#374151'}} placeholder="Opponent name" />
                {opponents.length > 0 && (
                  <button type="button" onClick={() => setShowCustomOpponent(false)} className={addButtonClass}>
                    Use Dropdown
                  </button>
                )}
              </div>
            )}
            {errorsMatch.opponent && <p className="text-red-400 text-sm mt-1">{errorsMatch.opponent.message}</p>}
          </div>
        ) : (
          <div></div>
        )}
      </div>

      <div style={{marginBottom: '2rem'}}>
        <label className={labelClass}>Format</label>
        <select 
          value={selectedFormat}
          onChange={(e) => handleFormatChange(e.target.value)}
          className={selectClass} 
          style={{backgroundColor: '#374151'}}
        >
          <option value="" style={{backgroundColor: '#374151', color: '#9ca3af'}}>Select format...</option>
          <option value="Constructed" style={{backgroundColor: '#374151', color: '#ffffff'}}>Constructed</option>
          <option value="Constructed In House" style={{backgroundColor: '#374151', color: '#ffffff'}}>Constructed In House</option>
          <option value="Draft" style={{backgroundColor: '#374151', color: '#ffffff'}}>Draft</option>
        </select>
        {(isDraftFormat ? errorsDraft.format : errorsMatch.format) && (
          <p className="text-red-400 text-sm mt-1">{(isDraftFormat ? errorsDraft.format : errorsMatch.format)?.message}</p>
        )}
      </div>

      {isDraftFormat ? (
        <>
          <div style={{marginBottom: '2rem'}}>
            <label className={labelClass}>Draft Type</label>
            <select {...registerDraft('draftType')} className={selectClass} style={{backgroundColor: '#374151'}}>
              <option value="" style={{backgroundColor: '#374151', color: '#9ca3af'}}>Select draft type...</option>
              <option value="Paper" style={{backgroundColor: '#374151', color: '#ffffff'}}>Paper Draft</option>
              <option value="MTGO" style={{backgroundColor: '#374151', color: '#ffffff'}}>MTGO Draft</option>
              <option value="Arena" style={{backgroundColor: '#374151', color: '#ffffff'}}>Arena Draft</option>
            </select>
            {errorsDraft.draftType && (
              <p className="text-red-400 text-sm mt-1">{errorsDraft.draftType.message}</p>
            )}
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem'}}>
            <div>
              <label className={labelClass}>Main Colors</label>
              <select {...registerDraft('mainColors')} className={selectClass} style={{backgroundColor: '#374151'}}>
                <option value="" style={{backgroundColor: '#374151', color: '#9ca3af'}}>Select main colors...</option>
                <option value="W" style={{backgroundColor: '#374151', color: '#ffffff'}}>White (W)</option>
                <option value="U" style={{backgroundColor: '#374151', color: '#ffffff'}}>Blue (U)</option>
                <option value="B" style={{backgroundColor: '#374151', color: '#ffffff'}}>Black (B)</option>
                <option value="R" style={{backgroundColor: '#374151', color: '#ffffff'}}>Red (R)</option>
                <option value="G" style={{backgroundColor: '#374151', color: '#ffffff'}}>Green (G)</option>
                <option value="WU" style={{backgroundColor: '#374151', color: '#ffffff'}}>White-Blue (WU)</option>
                <option value="WB" style={{backgroundColor: '#374151', color: '#ffffff'}}>White-Black (WB)</option>
                <option value="WR" style={{backgroundColor: '#374151', color: '#ffffff'}}>White-Red (WR)</option>
                <option value="WG" style={{backgroundColor: '#374151', color: '#ffffff'}}>White-Green (WG)</option>
                <option value="UB" style={{backgroundColor: '#374151', color: '#ffffff'}}>Blue-Black (UB)</option>
                <option value="UR" style={{backgroundColor: '#374151', color: '#ffffff'}}>Blue-Red (UR)</option>
                <option value="UG" style={{backgroundColor: '#374151', color: '#ffffff'}}>Blue-Green (UG)</option>
                <option value="BR" style={{backgroundColor: '#374151', color: '#ffffff'}}>Black-Red (BR)</option>
                <option value="BG" style={{backgroundColor: '#374151', color: '#ffffff'}}>Black-Green (BG)</option>
                <option value="RG" style={{backgroundColor: '#374151', color: '#ffffff'}}>Red-Green (RG)</option>
              </select>
              {errorsDraft.mainColors && (
                <p className="text-red-400 text-sm mt-1">{errorsDraft.mainColors.message}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Splash Colors (Optional)</label>
              <input 
                {...registerDraft('splashColors')} 
                type="text" 
                className={inputClass} 
                style={{backgroundColor: '#374151'}} 
                placeholder="e.g. W, WR, BG, etc."
              />
            </div>
          </div>

          <div style={{marginBottom: '2rem'}}>
            <label className={labelClass}>Record</label>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
              <input
                {...registerDraft('wins', { valueAsNumber: true })}
                type="number"
                min="0"
                className={`${inputClass} text-center`}
                style={{backgroundColor: '#374151'}}
              />
              <input
                {...registerDraft('losses', { valueAsNumber: true })}
                type="number"
                min="0"
                className={`${inputClass} text-center`}
                style={{backgroundColor: '#374151'}}
              />
            </div>
            {(errorsDraft.wins || errorsDraft.losses) && (
              <p className="text-red-400 text-sm mt-1">
                {errorsDraft.wins?.message || errorsDraft.losses?.message}
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem'}}>
            <div>
              <label className={labelClass}>Your Deck</label>
              <select {...registerMatch('playerDeck')} className={selectClass} style={{backgroundColor: '#374151'}}>
                <option value="" style={{backgroundColor: '#374151', color: '#9ca3af'}}>Select deck...</option>
                {decks.map(deck => (
                  <option key={deck} value={deck} style={{backgroundColor: '#374151', color: '#ffffff'}}>{deck}</option>
                ))}
              </select>
              {errorsMatch.playerDeck && <p className="text-red-400 text-sm mt-1">{errorsMatch.playerDeck.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Opp Deck</label>
              <select {...registerMatch('opponentDeck')} className={selectClass} style={{backgroundColor: '#374151'}}>
                <option value="" style={{backgroundColor: '#374151', color: '#9ca3af'}}>Select deck...</option>
                {decks.map(deck => (
                  <option key={deck} value={deck} style={{backgroundColor: '#374151', color: '#ffffff'}}>{deck}</option>
                ))}
              </select>
              {errorsMatch.opponentDeck && <p className="text-red-400 text-sm mt-1">{errorsMatch.opponentDeck.message}</p>}
            </div>
          </div>

          {isConstructedInHouse ? (
            <div style={{marginBottom: '2rem'}}>
              <label className={labelClass}>Match Results</label>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '0.5rem'}}>
                <div className="bg-blue-600 rounded px-2 py-1 text-center">
                  <span className="text-white font-medium text-sm">Pre-Sideboard</span>
                </div>
                <div className="bg-blue-600 rounded px-2 py-1 text-center">
                  <span className="text-white font-medium text-sm">Post-Sideboard</span>
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                <div className="bg-gray-600 rounded px-3 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={matchDetails[0]?.playerScore === 0 ? '' : matchDetails[0]?.playerScore}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        const newMatchDetails = [...matchDetails];
                        newMatchDetails[0] = {
                          ...newMatchDetails[0],
                          playerScore: value
                        };
                        setMatchDetails(newMatchDetails);
                      }}
                      className="w-12 rounded px-2 py-2 text-black text-center focus:outline-none text-sm"
                      style={{backgroundColor: '#f3f4f6'}}
                    />
                    <span className="text-white text-sm font-medium">-</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={matchDetails[0]?.opponentScore === 0 ? '' : matchDetails[0]?.opponentScore}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        const newMatchDetails = [...matchDetails];
                        newMatchDetails[0] = {
                          ...newMatchDetails[0],
                          opponentScore: value
                        };
                        setMatchDetails(newMatchDetails);
                      }}
                      className="w-12 rounded px-2 py-2 text-black text-center focus:outline-none text-sm"
                      style={{backgroundColor: '#f3f4f6'}}
                    />
                  </div>
                </div>

                <div className="bg-gray-600 rounded px-3 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={matchDetails[1]?.playerScore === 0 ? '' : matchDetails[1]?.playerScore}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        const newMatchDetails = [...matchDetails];
                        newMatchDetails[1] = {
                          ...newMatchDetails[1],
                          playerScore: value
                        };
                        setMatchDetails(newMatchDetails);
                      }}
                      className="w-12 rounded px-2 py-2 text-black text-center focus:outline-none text-sm"
                      style={{backgroundColor: '#f3f4f6'}}
                    />
                    <span className="text-white text-sm font-medium">-</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={matchDetails[1]?.opponentScore === 0 ? '' : matchDetails[1]?.opponentScore}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        const newMatchDetails = [...matchDetails];
                        newMatchDetails[1] = {
                          ...newMatchDetails[1],
                          opponentScore: value
                        };
                        setMatchDetails(newMatchDetails);
                      }}
                      className="w-12 rounded px-2 py-2 text-black text-center focus:outline-none text-sm"
                      style={{backgroundColor: '#f3f4f6'}}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{marginBottom: '2rem'}}>
              <div className="flex items-center justify-between mb-4">
                <label className={labelClass} style={{margin: 0}}>Games</label>
                <div className="flex gap-2">
                  <button type="button" onClick={removeGame} disabled={numGames <= 1} 
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm">
                    - Game
                  </button>
                  <button type="button" onClick={addGame} disabled={numGames >= 5}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm">
                    + Game
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {gameDetails.slice(0, numGames).map((game, index) => (
                  <div key={index} className="bg-gray-600 rounded-lg p-3">
                    <div className="grid grid-cols-4 gap-4 items-center">
                      <div className="bg-gray-500 border border-gray-400 rounded-lg p-2 text-center">
                        <span className="text-white font-medium text-sm">Game {game.gameNumber}</span>
                      </div>

                      <div className="col-span-3 flex items-center" style={{justifyContent: 'flex-start', gap: '2rem', padding: '0 1rem'}}>
                        <div className="flex gap-6">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`result-${index}`}
                              checked={game.result === 'W'}
                              onChange={() => updateGameDetail(index, 'result', 'W')}
                              className="mr-4 w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                            />
                            <span className="text-white font-medium">W</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`result-${index}`}
                              checked={game.result === 'L'}
                              onChange={() => updateGameDetail(index, 'result', 'L')}
                              className="mr-4 w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500"
                            />
                            <span className="text-white font-medium">L</span>
                          </label>
                        </div>

                        {index > 0 && game.result && (
                          <div className="text-white text-sm">
                            <span>Post-SB</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <span className="text-white text-lg font-semibold bg-gray-600 px-4 py-2 rounded-lg border border-gray-400">
                  Final Score: {calculateScore()}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
        style={{padding: '0.75rem', height: '3rem'}}
      >
        {isLoading ? 'Saving...' : `Save ${isDraftFormat ? 'Draft' : isConstructedInHouse ? 'Matches' : 'Match'} to Google Sheets`}
      </button>
      </form>
    </>
  );
};

export default MatchResultForm;