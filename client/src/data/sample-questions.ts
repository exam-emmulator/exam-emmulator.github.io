import type { QuestionBank } from '@/lib/types';

// Fetch question banks from the server API or static files
export async function fetchQuestionBanksFromServer(): Promise<QuestionBank[]> {
  try {
    // Try API first (for development with server)
    const apiResponse = await fetch('/api/question-banks');
    if (apiResponse.ok) {
      return await apiResponse.json();
    }
  } catch (error) {
    console.log('API not available, trying static files...');
  }
  
  // Fallback to static files (for GitHub Pages)
  try {
    const manifestResponse = await fetch('/bank/manifest.json');
    if (!manifestResponse.ok) {
      throw new Error('Failed to fetch manifest');
    }
    
    const manifest = await manifestResponse.json();
    const banks: QuestionBank[] = [];
    
    // Fetch each bank file
    for (const item of manifest) {
      try {
        const bankResponse = await fetch(`/bank/${item.file}`);
        if (bankResponse.ok) {
          const bank = await bankResponse.json();
          banks.push(bank);
        }
      } catch (err) {
        console.error(`Failed to load bank ${item.file}:`, err);
      }
    }
    
    return banks;
  } catch (error) {
    console.error('Error fetching question banks from static files:', error);
    return [];
  }
}

// All question banks are now loaded dynamically from the /bank folder
// No hardcoded sample banks - everything comes from JSON files
export const sampleQuestionBanks: QuestionBank[] = [];

export async function loadSampleQuestionBanks(): Promise<void> {
  // Load all banks from server/static files
  const serverBanks = await fetchQuestionBanksFromServer();
  
  const existingBanks = JSON.parse(localStorage.getItem('exam_portal_question_banks') || '[]');
  const existingIds = new Set(existingBanks.map((b: QuestionBank) => b.id));
  
  // Only add banks that don't already exist
  const newBanks = serverBanks.filter(b => !existingIds.has(b.id));
  
  if (newBanks.length > 0) {
    const allBanks = [...existingBanks, ...newBanks];
    localStorage.setItem('exam_portal_question_banks', JSON.stringify(allBanks));
  }
}
