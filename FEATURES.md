# Advanced Features Guide

This document describes the advanced features available in the Exam Practice Portal.

## Table of Contents

1. [Hints (Practice Mode)](#hints-practice-mode)
2. [Exam Sections with Weights](#exam-sections-with-weights)
3. [Question Shuffling](#question-shuffling)
4. [Option Shuffling](#option-shuffling)
5. [Weighted Questions](#weighted-questions)
6. [Difficulty Levels](#difficulty-levels)
7. [Passing Score](#passing-score)
8. [Time Limits](#time-limits)

---

## Hints (Practice Mode)

### Overview
Hints provide students with helpful clues without revealing the answer directly. They're only available in practice mode.

### Configuration

```json
{
  "question": "Which AWS service provides managed Kubernetes?",
  "options": ["ECS", "EKS", "Fargate", "Lambda"],
  "correct_answer": "EKS",
  "hint": "Look for the service with 'Kubernetes' in its full name"
}
```

### Behavior

- **Practice Mode**: Hint button appears below the question
- **Exam Mode**: Hints are hidden
- **Tracking**: System tracks which questions had hints revealed
- **UI**: Click "💡 Show Hint" to reveal the hint
- **Styling**: Hints appear in a blue card with lightbulb icon

### Use Cases

- Certification exam preparation
- Educational quizzes
- Self-paced learning
- Reducing frustration for difficult questions

---

## Exam Sections with Weights

### Overview
Organize questions into sections (domains) and assign percentage weights to each section. Results show performance by section.

### Configuration

```json
{
  "sections": [
    {
      "name": "Domain 1: Design Resilient Architectures",
      "description": "High availability and fault tolerance",
      "weight": 30
    },
    {
      "name": "Domain 2: Security",
      "description": "Security best practices",
      "weight": 25
    },
    {
      "name": "Domain 3: Performance",
      "weight": 25
    },
    {
      "name": "Domain 4: Cost Optimization",
      "weight": 20
    }
  ],
  "questions": [
    {
      "question": "How do you ensure high availability?",
      "section": "Domain 1: Design Resilient Architectures",
      ...
    }
  ]
}
```

### Requirements

- Section weights should add up to 100 (representing percentages)
- Questions must have a `section` field matching a section name
- Section names must be unique

### Results Display

The results page shows:
- Overall score
- Score for each section
- Weight of each section
- Progress bar for each section
- Color-coded performance (green ≥80%, yellow ≥60%, red <60%)

### Use Cases

- AWS certification exams (multiple domains)
- CompTIA certifications
- Academic exams with different topics
- Skills assessments with weighted categories

---

## Question Shuffling

### Overview
Randomize the order of questions in exam mode to prevent memorization of question sequence.

### Configuration

```json
{
  "shuffleQuestions": true
}
```

### Behavior

- **Exam Mode**: Questions appear in random order
- **Practice Mode**: Questions always appear in original order
- **Per Attempt**: Shuffling happens once when exam starts
- **Consistent**: Same shuffle order throughout the attempt
- **Navigation**: Question numbers still work correctly

### Benefits

- Prevents pattern memorization
- More realistic exam experience
- Reduces cheating in group settings
- Tests actual knowledge, not sequence memory

---

## Option Shuffling

### Overview
Randomize the order of answer options to prevent memorization of answer positions.

### Configuration

```json
{
  "shuffleOptions": true
}
```

### Behavior

- **Both Modes**: Works in exam and practice mode
- **Per Question**: Each question has its own shuffle
- **Per Attempt**: Shuffling happens once when exam starts
- **Consistent**: Same shuffle order if you return to a question
- **Correct Answer**: System tracks the actual answer text, not position

### Benefits

- Prevents "it's always B" patterns
- Tests understanding, not position memory
- More challenging and realistic
- Reduces effectiveness of answer key memorization

### Example

Original:
```
A. Wrong answer
B. Correct answer
C. Wrong answer
D. Wrong answer
```

Shuffled:
```
A. Wrong answer
B. Wrong answer
C. Correct answer  ← Still tracked correctly
D. Wrong answer
```

---

## Weighted Questions

### Overview
Assign different point values to questions based on difficulty or importance.

### Configuration

```json
{
  "question": "Complex scenario with multiple services...",
  "weight": 3,
  "difficulty": "hard"
}
```

### Default Behavior

- Questions without `weight` field default to 1 point
- Final score calculated as: (earned points / total points) × 100

### Scoring Example

```
Question 1: 1 point (correct) = 1 point earned
Question 2: 2 points (wrong) = 0 points earned
Question 3: 3 points (correct) = 3 points earned
Question 4: 1 point (correct) = 1 point earned

Total: 7 points possible
Earned: 5 points
Score: (5/7) × 100 = 71%
```

### Results Display

- Shows "X/Y points earned"
- Blue info card explains weighted scoring
- Individual questions show point value badge

### Use Cases

- Emphasize important concepts
- Reward complex problem-solving
- Match real certification exam scoring
- Differentiate question difficulty

---

## Difficulty Levels

### Overview
Label questions with difficulty levels for better organization and student expectations.

### Configuration

```json
{
  "question": "What is the CAP theorem?",
  "difficulty": "hard"
}
```

### Available Levels

- `"easy"` - Green badge
- `"medium"` - Blue badge
- `"hard"` - Red badge

### Display

- Badge shown next to question number
- Color-coded for quick recognition
- Helps students gauge question complexity

### Best Practices

- Combine with weighted scoring (hard = more points)
- Use consistently across question bank
- Consider student skill level when assigning

---

## Passing Score

### Overview
Set a minimum score required to pass the exam.

### Configuration

```json
{
  "passingScore": 72
}
```

### Behavior

- Value is a percentage (0-100)
- Results page shows "Passed" or "Not Passed"
- Color-coded card (green for pass, red for fail)
- Shows passing score vs. actual score

### Results Display

```
✓ Passed!
Passing score: 72% • Your score: 85%
```

or

```
✗ Not Passed
Passing score: 72% • Your score: 65%
```

### Use Cases

- Certification exams (e.g., AWS requires 72%)
- Academic assessments
- Skills validation
- Training completion requirements

---

## Time Limits

### Overview
Set a time limit for exam mode to simulate real exam conditions.

### Configuration

```json
{
  "timeLimit": 90
}
```

### Behavior

- Value in minutes
- Timer shown in exam mode header
- Counts up from 00:00
- Visual warning when approaching limit
- Auto-submit when time expires (future feature)

### Display

```
🕐 01:23:45
```

### Best Practices

- AWS exams: 130-180 minutes
- CompTIA exams: 90 minutes
- Academic exams: 60-120 minutes
- Add 20% buffer for reading time

---

## Combining Features

### Example: Full-Featured Exam

```json
{
  "id": "aws-solutions-architect",
  "name": "AWS Solutions Architect Associate",
  "description": "Full practice exam with all features",
  "shuffleQuestions": true,
  "shuffleOptions": true,
  "passingScore": 72,
  "timeLimit": 130,
  "sections": [
    {
      "name": "Domain 1: Design Resilient Architectures",
      "weight": 30
    },
    {
      "name": "Domain 2: Security",
      "weight": 25
    },
    {
      "name": "Domain 3: Performance",
      "weight": 25
    },
    {
      "name": "Domain 4: Cost Optimization",
      "weight": 20
    }
  ],
  "questions": [
    {
      "question": "Design a highly available architecture...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option B",
      "explanation": "Detailed explanation...",
      "hint": "Think about multiple AZs",
      "section": "Domain 1: Design Resilient Architectures",
      "weight": 2,
      "difficulty": "medium",
      "references": [
        "https://docs.aws.amazon.com/..."
      ]
    }
  ]
}
```

### Feature Compatibility Matrix

| Feature | Exam Mode | Practice Mode | Notes |
|---------|-----------|---------------|-------|
| Hints | ❌ | ✅ | Only shown in practice |
| Sections | ✅ | ✅ | Always displayed |
| Question Shuffle | ✅ | ❌ | Only in exam mode |
| Option Shuffle | ✅ | ✅ | Both modes |
| Weighted Questions | ✅ | ✅ | Both modes |
| Difficulty Badges | ✅ | ✅ | Both modes |
| Passing Score | ✅ | ✅ | Both modes |
| Time Limit | ✅ | ❌ | Only in exam mode |

---

## Migration Guide

### Adding Features to Existing Banks

1. **Add hints** (optional):
   ```json
   "hint": "Your helpful hint here"
   ```

2. **Add sections** (optional):
   ```json
   "sections": [...],
   "questions": [
     {
       "section": "Section Name",
       ...
     }
   ]
   ```

3. **Add weights** (optional):
   ```json
   "weight": 2
   ```

4. **Enable shuffling** (optional):
   ```json
   "shuffleQuestions": true,
   "shuffleOptions": true
   ```

5. **Set passing score** (optional):
   ```json
   "passingScore": 70
   ```

### Backward Compatibility

All features are optional. Existing question banks work without changes:
- No hints = no hint button shown
- No sections = no section display
- No weight = defaults to 1 point
- No shuffle flags = no shuffling
- No passing score = no pass/fail display

---

## Best Practices

### For Certification Exams

- ✅ Use sections matching official exam domains
- ✅ Set weights matching official percentages
- ✅ Enable question and option shuffling
- ✅ Set realistic time limits
- ✅ Use passing score from official requirements
- ✅ Add hints for practice mode
- ✅ Weight complex scenarios higher

### For Academic Exams

- ✅ Organize by topics/chapters
- ✅ Use difficulty levels
- ✅ Provide hints for learning
- ✅ Set appropriate time limits
- ✅ Use weighted questions for essays/problems

### For Skills Assessments

- ✅ Group by skill categories
- ✅ Weight important skills higher
- ✅ Use difficulty progression
- ✅ Set passing scores based on job requirements

---

## Troubleshooting

### Sections not showing
- Check that `sections` array is defined
- Verify questions have matching `section` field
- Ensure section names match exactly (case-sensitive)

### Shuffling not working
- Only works in exam mode (questions)
- Check `shuffleQuestions` or `shuffleOptions` is `true`
- Refresh page to get new shuffle

### Weighted scoring not displaying
- Ensure questions have `weight` field
- At least one question must have weight > 1
- Check results page for weighted score card

### Passing score not showing
- Add `passingScore` field to question bank
- Value must be between 0 and 100
- Results page will show pass/fail status

---

## Examples

See these example files:
- `bank/advanced-example.json` - All features demonstrated
- `bank/aws_ai_practitioner_bank.json` - Real certification exam
- `bank/example-questions.json` - Simple basic example

---

## Future Enhancements

Planned features:
- Auto-submit when time expires
- Partial credit for multi-select questions
- Question pools (random selection from larger set)
- Adaptive difficulty
- Detailed analytics per section
- Export results to PDF
- Study mode with spaced repetition
