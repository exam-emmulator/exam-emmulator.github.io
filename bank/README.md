# Question Bank Files

This folder contains JSON files with exam question banks that are automatically loaded by the application.

## File Format

### Basic Format

Each JSON file should follow this structure. Two formats are supported:

#### Format 1: Array-based (Legacy)
```json
{
  "id": "unique-bank-id",
  "name": "Display Name for the Question Bank",
  "description": "Optional description of the question bank",
  "dateAdded": "2025-12-01T10:59:45Z",
  "questions": [
    {
      "question": "Your question text here?",
      "options": [
        "Option A text",
        "Option B text",
        "Option C text",
        "Option D text"
      ],
      "correct_answer": "Option A text",
      "explanation": "Optional explanation of the correct answer",
      "references": ["Optional array of reference links"],
      "hint": "Optional hint for the question"
    }
  ]
}
```

#### Format 2: Object-based (Optimized - Recommended)
```json
{
  "id": "unique-bank-id",
  "name": "Display Name for the Question Bank",
  "description": "Optional description of the question bank",
  "dateAdded": "2025-12-01T10:59:45Z",
  "questions": [
    {
      "question": "Your question text here?",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correct_answer": "A",
      "explanation": "Optional explanation of the correct answer",
      "references": ["Optional array of reference links"],
      "hint": "Optional hint for the question"
    }
  ]
}
```

**Benefits of Object-based format:**
- Reduces file size by ~4-5%
- Easier to reference answers
- More compact for multi-select questions
- Automatically converted by `npm run optimize-banks`

### Advanced Format with Sections and Weights

```json
{
  "id": "aws-solutions-architect",
  "name": "AWS Solutions Architect Associate",
  "description": "Practice exam with weighted sections",
  "shuffleQuestions": true,
  "shuffleOptions": true,
  "passingScore": 72,
  "timeLimit": 130,
  "sections": [
    {
      "name": "Design Resilient Architectures",
      "description": "Questions about high availability and fault tolerance",
      "weight": 30
    },
    {
      "name": "Design High-Performing Architectures",
      "weight": 28
    },
    {
      "name": "Design Secure Applications",
      "weight": 24
    },
    {
      "name": "Design Cost-Optimized Architectures",
      "weight": 18
    }
  ],
  "questions": [
    {
      "question": "Which service provides automatic scaling?",
      "options": ["EC2", "Auto Scaling", "Lambda", "ECS"],
      "correct_answer": "Auto Scaling",
      "explanation": "Auto Scaling automatically adjusts capacity",
      "hint": "Think about the service name",
      "section": "Design Resilient Architectures",
      "weight": 2,
      "difficulty": "medium"
    }
  ]
}
```

## Field Descriptions

### Required Fields

- **id**: Unique identifier for the question bank (string)
- **name**: Display name shown in the UI (string)
- **questions**: Array of question objects (array)
  - **question**: The question text (string)
  - **options**: Array of answer options (array of strings)
  - **correct_answer**: The correct answer text or array of texts for multi-select (string or array)

### Optional Fields

**Question Bank Level:**
- **description**: Brief description of the question bank (string)
- **dateAdded**: ISO 8601 timestamp (string, auto-generated if missing)
- **sections**: Array of exam sections with weights (array of objects)
- **shuffleQuestions**: Whether to shuffle questions in exam mode (boolean, default: false)
- **shuffleOptions**: Whether to shuffle answer options (boolean, default: false)
- **passingScore**: Minimum score to pass in percentage (number, e.g., 70)
- **timeLimit**: Time limit in minutes (number)

**Question Level:**
- **explanation**: Explanation of why the answer is correct (string)
- **references**: Array of reference URLs or citations (array of strings)
- **hint**: Helpful hint for the question (string, shown in practice mode)
- **section**: Section name this question belongs to (string)
- **weight**: Points for this question (number, default: 1)
- **difficulty**: Question difficulty level (string: 'easy', 'medium', or 'hard')

## Multi-Select Questions

For questions with multiple correct answers, use an array or comma-separated string:

```json
{
  "question": "Which of the following are AWS compute services? (Select TWO)",
  "options": [
    "Amazon EC2",
    "Amazon S3",
    "AWS Lambda",
    "Amazon RDS"
  ],
  "correct_answer": ["Amazon EC2", "AWS Lambda"],
  "explanation": "EC2 and Lambda are compute services, while S3 is storage and RDS is database."
}
```

Or with comma-separated string:

```json
{
  "correct_answer": "Amazon EC2, AWS Lambda"
}
```

## Adding New Question Banks

1. Create a new `.json` file in this folder
2. Follow the format above
3. The file will be automatically loaded when the server starts
4. If your file uses object-style options (A, B, C, D), run `npm run normalize-banks` to convert it

## Normalizing Question Banks

If you have a question bank with options in object format:

```json
{
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A"
}
```

Run the normalization script:

```bash
npm run normalize-banks
```

This will convert all question banks to the standard array format.

## File Naming

- Use lowercase with hyphens: `aws-solutions-architect.json`
- The filename (without .json) will be used as the ID if no ID is specified
- Be descriptive: `aws-ai-practitioner-bank.json` is better than `questions.json`

## Validation

The application will validate:
- Each question has required fields (question, options, correct_answer)
- Options array has at least 2 items
- Correct answers match available options
- JSON is valid and parseable

## Advanced Features

### Exam Sections with Weights

Define sections to organize questions and calculate section-specific scores:

```json
{
  "sections": [
    {
      "name": "Domain 1: Cloud Concepts",
      "description": "Understanding of cloud computing principles",
      "weight": 26
    },
    {
      "name": "Domain 2: Security",
      "weight": 25
    }
  ],
  "questions": [
    {
      "question": "What is cloud computing?",
      "section": "Domain 1: Cloud Concepts",
      "weight": 1,
      ...
    }
  ]
}
```

- Section weights should add up to 100 (representing percentages)
- Questions are assigned to sections via the `section` field
- Results page shows performance by section

### Question Shuffling

Enable random question order in exam mode:

```json
{
  "shuffleQuestions": true,
  "shuffleOptions": true
}
```

- `shuffleQuestions`: Randomizes question order (exam mode only)
- `shuffleOptions`: Randomizes answer option order
- Practice mode always shows questions in original order
- Shuffling happens once per exam attempt

### Weighted Questions

Assign different point values to questions:

```json
{
  "question": "Complex scenario question...",
  "weight": 3,
  "difficulty": "hard"
}
```

- Default weight is 1 point
- Use higher weights for more important/difficult questions
- Final score is calculated based on total points earned
- Difficulty badge shown in UI: easy (green), medium (blue), hard (red)

### Hints (Practice Mode Only)

Add hints that students can reveal:

```json
{
  "question": "Which AWS service...?",
  "hint": "Think about services that start with 'S'",
  "options": ["EC2", "S3", "RDS", "Lambda"]
}
```

- Hints only appear in practice mode
- Students must click "Show Hint" to reveal
- Tracked in attempt history

### Passing Score

Set a minimum passing score:

```json
{
  "passingScore": 70
}
```

- Score is in percentage (0-100)
- Results page shows "Passed" or "Failed"
- Useful for certification-style exams

### Time Limit

Set a time limit for exams:

```json
{
  "timeLimit": 90
}
```

- Time in minutes
- Timer shown in exam mode
- Warning when time is running out
- Auto-submit when time expires

## Example Files

- `aws_ai_practitioner_bank.json` - Complete example with 100+ questions
- `example-questions.json` - Simple example with basic features
