# Question Bank Files

This folder contains JSON files with exam question banks that are automatically loaded by the application.

## File Format

Each JSON file should follow this structure:

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

## Field Descriptions

### Required Fields

- **id**: Unique identifier for the question bank (string)
- **name**: Display name shown in the UI (string)
- **questions**: Array of question objects (array)
  - **question**: The question text (string)
  - **options**: Array of answer options (array of strings)
  - **correct_answer**: The correct answer text or array of texts for multi-select (string or array)

### Optional Fields

- **description**: Brief description of the question bank (string)
- **dateAdded**: ISO 8601 timestamp (string, auto-generated if missing)
- **explanation**: Explanation of why the answer is correct (string)
- **references**: Array of reference URLs or citations (array of strings)
- **hint**: Helpful hint for the question (string)

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

## Example Files

See `aws_ai_practitioner_bank.json` for a complete example with 100+ questions.
