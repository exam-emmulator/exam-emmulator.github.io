import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Question {
  question: string;
  options: string[];
  correct_answer: string | string[];
  explanation?: string;
  [key: string]: any;
}

interface QuestionBank {
  questions: Question[];
  [key: string]: any;
}

function cleanText(text: string): string {
  return text
    .replace(/\n/g, ' ')  // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();              // Trim leading/trailing spaces
}

function cleanQuestion(question: Question): Question {
  const cleaned: Question = {
    ...question,
    question: cleanText(question.question),
    options: question.options.map(opt => cleanText(opt)),
  };

  // Clean correct_answer
  if (Array.isArray(question.correct_answer)) {
    cleaned.correct_answer = question.correct_answer.map(ans => cleanText(ans));
  } else {
    cleaned.correct_answer = cleanText(question.correct_answer);
  }

  // Clean explanation if exists
  if (question.explanation) {
    cleaned.explanation = cleanText(question.explanation);
  }

  // Clean hint if exists
  if (question.hint) {
    cleaned.hint = cleanText(question.hint);
  }

  return cleaned;
}

async function cleanJsonFile(filePath: string): Promise<void> {
  console.log(`Cleaning: ${filePath}`);
  
  const content = await fs.readFile(filePath, 'utf-8');
  const bank: QuestionBank = JSON.parse(content);
  
  let modified = false;
  
  // Clean all questions
  bank.questions = bank.questions.map((question, idx) => {
    const cleaned = cleanQuestion(question);
    
    // Check if anything changed
    if (JSON.stringify(cleaned) !== JSON.stringify(question)) {
      modified = true;
      console.log(`  ✓ Cleaned question ${idx + 1}`);
    }
    
    return cleaned;
  });
  
  if (modified) {
    await fs.writeFile(filePath, JSON.stringify(bank, null, 2), 'utf-8');
    console.log(`✓ Saved cleaned version: ${filePath}`);
  } else {
    console.log(`✓ No changes needed: ${filePath}`);
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
      await cleanJsonFile(filePath);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
    console.log('');
  }
  
  console.log('Done!');
}

main().catch(console.error);
