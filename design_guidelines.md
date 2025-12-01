# Design Guidelines: Exam Practice Portal

## Design Approach
**System Selected:** Material Design 3 principles adapted for educational applications
**Justification:** Information-dense exam interface requiring clear hierarchy, strong form patterns, and intuitive data visualization for stats/progress tracking.

## Typography System
- **Headings:** Inter or Roboto, weights 600-700
  - H1: 2.5rem (exam titles)
  - H2: 1.875rem (section headers)
  - H3: 1.5rem (question numbers)
- **Body:** Same family, weight 400
  - Question text: 1.125rem (enhanced readability)
  - Options: 1rem
  - Metadata: 0.875rem

## Layout & Spacing
**Spacing Scale:** Tailwind units 3, 4, 6, 8, 12, 16
- Card padding: p-6 to p-8
- Section gaps: gap-6 to gap-8
- Button spacing: px-6 py-3
- Container: max-w-4xl for exam view, max-w-6xl for dashboard

## Core Components

### Dashboard/Home Screen
- Card-based layout presenting exam banks and upload options
- Grid: 2-column on desktop (grid-cols-2), single on mobile
- Each exam bank card: title, question count, last attempt score, "Start Exam/Practice" CTAs
- Upload zone: Dashed border card with file input and drag-drop functionality
- Stats sidebar: Recent attempts, overall accuracy, total questions attempted

### Exam Interface
- Fixed header: Question counter (3/50), timer (Exam mode only), mode indicator
- Main content area: Single question display with generous whitespace
- Question card: Elevated surface with question text and options as radio buttons (single) or checkboxes (multi-select)
- Navigation footer: "Previous", "Next", "Flag for Review", "Submit" buttons
- Progress indicator: Linear progress bar showing completion percentage

### Practice Mode Feedback
- Immediate visual feedback on option selection:
  - Correct answers: Green accent with checkmark icon
  - Incorrect answers: Red accent with X icon, showing correct answer highlighted in green
- Explanation card below question (if available in JSON)

### Results/History Page
- Summary cards at top: Score percentage, correct/wrong/skipped counts
- Detailed review section: Accordion list of all questions
  - Each item shows: question, user's answer, correct answer, explanation
  - Visual indicators for correct/incorrect
- Performance chart: Simple bar chart showing attempt history over time

### Question Bank Manager
- Table view listing all loaded/uploaded question banks
- Columns: Name, Question Count, Date Added, Actions (Start/Delete)
- Upload button prominently placed

## Form Elements
- Radio buttons/Checkboxes: Large hit areas (min 44x44px), clear labels
- Buttons: Rounded corners (rounded-lg), sufficient padding
  - Primary CTA: Solid fill
  - Secondary: Outline style
  - Danger (Submit): Distinct treatment
- Input fields: Clear borders, focus states with subtle shadows

## Interactions & States
- Hover states: Subtle background shifts on cards/buttons
- Active question: Highlighted in navigation or question list
- Flagged questions: Bookmark icon indicator
- Loading states: Skeleton screens for data fetching
- Empty states: Friendly messaging with upload prompt

## Exam-Specific Patterns
- Clean, distraction-free layout during exam mode
- Minimal animations (avoid distracting from content)
- High contrast for readability during extended sessions
- Clear visual separation between questions
- Prominent "Submit Exam" confirmation modal

## Accessibility
- Focus indicators on all interactive elements
- Keyboard navigation support (arrow keys for question navigation)
- Screen reader labels for icons and buttons
- Sufficient color contrast (4.5:1 minimum)
- Clear error messages for validation

## Images
**No hero images required.** This is a functional application prioritizing clarity.
**Icon Usage:** Heroicons via CDN for UI elements (checkmarks, X marks, clock, bookmark, upload, chart icons)

## Data Visualization
- Simple progress bars for completion tracking
- Donut chart for score breakdown (correct/wrong/unanswered)
- Line/bar charts for attempt history (use Chart.js via CDN)

This design prioritizes focus, clarity, and efficient exam-taking experience while maintaining a professional, trustworthy educational platform aesthetic.