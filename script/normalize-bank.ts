import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Question {
  question: string;
  options: string[] | Record<string, string>;
  correct_answer: string | string[];
  explanation?: string;
  references?: string[];
  hint?: string;
}

interface QuestionBank {
  id: string;
  name: string;
  description?: string;
  dateAdded: string;
  questions: Question[];
}

async function normalizeQuestionBank(filePath: string): Promise<void> {
  console.log(`Processing: ${filePath}`);
  
  const content = await fs.readFile(filePath, 'utf-8');
  const bank: QuestionBank = JSON.parse(content);
  
  let modified = false;
  
  bank.questions = bank.questions.map((question) => {
    // Normalize options from object to array
    if (question.options && typeof question.options === 'object' && !Array.isArray(question.options)) {
      const optionsObj = question.options as Record<string, string>;
      const optionsArray = Object.keys(optionsObj)
        .sort()
        .map(key => optionsObj[key]);
      
      // Normalize correct_answer from letter to actual text
      if (typeof question.correct_answer === 'string' && question.correct_answer.length <= 3) {
        const answerKeys = question.correct_answer.split(',').map(k => k.trim());
        const answerTexts = answerKeys.map(key => optionsObj[key]).filter(Boolean);
        
        question.correct_answer = answerTexts.length === 1 ? answerTexts[0] : answerTexts;
      }
      
      question.options = optionsArray;
      modified = true;
    }
    
    return question;
  });
  
  if (modified) {
    await fs.writeFile(filePath, JSON.stringify(bank, null, 2), 'utf-8');
    console.log(`✓ Normalized: ${filePath}`);
  } else {
    console.log(`✓ Already normalized: ${filePath}`);
  }
}

async function main() {
  const bankDir = path.join(__dirname, '..', 'bank');
  const files = await fs.readdir(bankDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  
  console.log(`Found ${jsonFiles.length} JSON file(s) in bank folder\n`);
  
  for (const file of jsonFiles) {
    const filePath = path.join(bankDir, file);
    try {
      await normalizeQuestionBank(filePath);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
  
  console.log('\nDone!');
}

main().catch(console.error);
