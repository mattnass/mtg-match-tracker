interface MatchResult {
  id?: string;
  player: string;
  opponent: string;
  format: string;
  playerDeck: string;
  opponentDeck: string;
  games: string;
  sideboardStatus?: string;
  // Draft specific fields
  mainColors?: string;
  splashColors?: string;
  wins?: number;
  losses?: number;
  draftType?: string;
  sheetTab?: string;
}

class AppsScriptService {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async appendData(data: MatchResult): Promise<boolean> {
    try {
      console.log('Sending data to Apps Script:', data);
      console.log('Using Apps Script URL:', this.url);
      
      // Use GET request with query parameters to avoid CORS issues
      const params = new URLSearchParams({
        action: 'addMatch',
        data: JSON.stringify(data)
      });
      
      const fullUrl = `${this.url}?${params}`;
      console.log('Full request URL length:', fullUrl.length);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        redirect: 'follow'
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, text: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response was:', responseText);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('Apps Script response:', result);
      console.log('Success field:', result.success);
      console.log('Success type:', typeof result.success);
      
      // Check for success - handle both boolean and string
      const isSuccess = result.success === true || result.success === 'true' || String(result.success).toLowerCase() === 'true';
      
      if (isSuccess) {
        console.log('✅ Apps Script returned success');
        return true;
      } else {
        console.log('❌ Apps Script returned failure:', result.error || 'Unknown error');
        console.error('Full error result:', result);
        return false;
      }
    } catch (error) {
      console.error('Error in appendData:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async getData(): Promise<any> {
    try {
      console.log('Getting data from Apps Script');
      
      const response = await fetch(`${this.url}?action=getMatches`, {
        method: 'GET',
        redirect: 'follow'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Apps Script getData response:', result);
      
      if (result.success) {
        return result; // Return the whole result object with players and decks
      } else {
        console.warn('Unexpected data format from Apps Script:', result);
        return { success: false, players: [], decks: [] };
      }
    } catch (error) {
      console.error('Error in getData:', error);
      return { success: false, players: [], decks: [] };
    }
  }
}

export default AppsScriptService;