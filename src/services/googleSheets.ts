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

class AppsScriptService {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async appendData(data: MatchResult): Promise<boolean> {
    try {
      console.log('Sending data to Apps Script:', data);
      
      // Use GET request with query parameters to avoid CORS issues
      const params = new URLSearchParams({
        action: 'addMatch',
        data: JSON.stringify(data)
      });
      
      const response = await fetch(`${this.url}?${params}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Apps Script response:', result);
      
      return result.success === true;
    } catch (error) {
      console.error('Error in appendData:', error);
      return false;
    }
  }

  async getData(): Promise<MatchResult[]> {
    try {
      console.log('Getting data from Apps Script');
      
      const response = await fetch(`${this.url}?action=getMatches`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Apps Script getData response:', result);
      
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      } else {
        console.warn('Unexpected data format from Apps Script:', result);
        return [];
      }
    } catch (error) {
      console.error('Error in getData:', error);
      return [];
    }
  }
}

export default AppsScriptService;