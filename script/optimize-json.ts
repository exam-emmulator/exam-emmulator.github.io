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
  [key: string]: any;
}

interface QuestionBank {
  questions: Question[];
  [key: string]: any;
}

function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index); // A, B, C, D, etc.
}

function optimizeQuestion(question: Question): Question {
  const optimized: Question = { ...question };
  
  // Convert options array to object if it's an array
  if (Array.isArray(question.options)) {
    const optionsObj: Record<string, string> = {};
    question.options.forEach((opt, idx) => {
      optionsObj[getOptionLabel(idx)] = opt;
    });
    optimized.options = optionsObj;
    
    // Convert correct_answer from text to letter(s)
    if (Array.isArray(question.correct_answer)) {
      // Multiple correct answers
      const correctLetters = question.correct_answer.map(ans => {
        const normalizedAns = ans.trim().toLowerCase();
        const index = question.options.findIndex(opt => 
          opt.trim().toLowerCase() === normalizedAns
        );
        return index >= 0 ? getOptionLabel(index) : ans;
      });
      optimized.correct_answer = correctLetters.join(', ');
    } else {
      // Single correct answer
      const normalizedAns = question.correct_answer.trim().toLowerCase();
      const index = question.options.findIndex(opt => 
        opt.trim().toLowerCase() === normalizedAns
      );
      if (index >= 0) {
        optimized.correct_answer = getOptionLabel(index);
      }
    }
  }
  
  return optimized;
}

async function optimizeJsonFile(filePath: string): Promise<void> {
  console.log(`Optimizing: ${filePath}`);
  
  const content = await fs.readFile(filePath, 'utf-8');
  const bank: QuestionBank = JSON.parse(content);
  
  const originalSize = Buffer.byteLength(content, 'utf-8');
  
  // Optimize all questions
  bank.questions = bank.questions.map((question, idx) => {
    const optimized = optimizeQuestion(question);
    return optimized;
  });
  
  const optimizedContent = JSON.stringify(bank, null, 2);
  const optimizedSize = Buffer.byteLength(optimizedContent, 'utf-8');
  const savings = originalSize - optimizedSize;
  const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
  
  await fs.writeFile(filePath, optimizedContent, 'utf-8');
  
  console.log(`  Original size: ${(originalSize / 1024).toFixed(2)} KB`);
  console.log(`  Optimized size: ${(optimizedSize / 1024).toFixed(2)} KB`);
  console.log(`  Saved: ${(savings / 1024).toFixed(2)} KB (${savingsPercent}%)`);
  console.log(`✓ Saved optimized version: ${filePath}`);
}

async function main() {
  const bankDir = path.join(__dirname, '..', 'bank');
  const files = await fs.readdir(bankDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  
  console.log(`Found ${jsonFiles.length} JSON file(s) in bank folder\n`);
  
  let totalOriginal = 0;
  let totalOptimized = 0;
  
  for (const file of jsonFiles) {
    const filePath = path.join(bankDir, file);
    try {
      const beforeSize = (await fs.stat(filePath)).size;
      await optimizeJsonFile(filePath);
      const afterSize = (await fs.stat(filePath)).size;
      
      totalOriginal += beforeSize;
      totalOptimized += afterSize;
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
    console.log('');
  }
  
  const totalSavings = totalOriginal - totalOptimized;
  const totalSavingsPercent = ((totalSavings / totalOriginal) * 100).toFixed(1);
  
  console.log('='.repeat(50));
  console.log(`Total original size: ${(totalOriginal / 1024).toFixed(2)} KB`);
  console.log(`Total optimized size: ${(totalOptimized / 1024).toFixed(2)} KB`);
  console.log(`Total saved: ${(totalSavings / 1024).toFixed(2)} KB (${totalSavingsPercent}%)`);
  console.log('='.repeat(50));
  console.log('\nDone!');
}

main().catch(console.error);
