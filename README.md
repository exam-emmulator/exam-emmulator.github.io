# Exam Practice Portal

A modern exam and practice website that dynamically loads question banks from JSON files. Take exams or practice with instant feedback, and track your progress over time.

## Features

### Core Features
- **Dynamic Question Banks**: Automatically loads all JSON files from the `bank` folder
- **Multiple Question Banks**: Upload your own JSON question files or use pre-built sample sets
- **Exam Mode**: Timed exam experience with question navigation and submit functionality
- **Practice Mode**: Instant feedback after each question with explanations
- **Progress Tracking**: View attempt history, scores, and performance trends
- **Local Storage**: All data persists in your browser
- **Dark/Light Mode**: Toggle between themes for comfortable studying
- **Responsive Design**: Works on desktop and tablet devices

### Advanced Features
- **💡 Hints**: Reveal helpful hints in practice mode without giving away answers
- **📊 Exam Sections**: Organize questions into weighted sections (domains) with individual scoring
- **🔀 Question Shuffling**: Randomize question order in exam mode to prevent memorization
- **🎲 Option Shuffling**: Randomize answer options for more challenging practice
- **⚖️ Weighted Questions**: Assign different point values based on difficulty or importance
- **🎯 Difficulty Levels**: Label questions as easy, medium, or hard with color-coded badges
- **✅ Passing Score**: Set minimum passing scores with pass/fail indicators
- **⏱️ Time Limits**: Configure time limits for realistic exam simulation

See [FEATURES.md](FEATURES.md) for detailed documentation on advanced features.

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Add your question banks**:
   - Place JSON files in the `bank` folder
   - See `bank/README.md` for format details

3. **Run the application**:
   ```bash
   npm run dev
   ```

4. **Access the app**:
   - Open `http://localhost:5000` in your browser

5. **Deploy to GitHub Pages**:
   - See `DEPLOYMENT.md` for detailed instructions
   - Simply push to main branch for automatic deployment

## Deploying to GitHub Pages

### Automatic Deployment

1. Push this repository to GitHub
2. Go to your repository **Settings** > **Pages**
3. Under "Build and deployment", select **GitHub Actions** as the source
4. Add your question bank JSON files to the `bank` folder
5. Push any changes to the `main` or `master` branch to trigger a deployment
6. Your site will be available at `https://<username>.github.io/<repository-name>/`

**Note**: All JSON files in the `bank` folder will be automatically included in the build and deployed to GitHub Pages.

### Manual Build

To build the static site locally:

```bash
npm install
npx tsx script/build-static.ts
```

The output will be in the `dist/public` directory, including:
- All static assets
- Question bank files in `dist/public/bank/`
- A manifest file at `dist/public/bank/manifest.json`

To test the build locally:
```bash
npx serve dist/public
```

## JSON Question Format

Upload JSON files with this structure:

```json
[
  {
    "question": "What is the capital of France?",
    "options": ["London", "Paris", "Berlin", "Madrid"],
    "correct_answer": "Paris",
    "explanation": "Paris has been the capital of France since the 10th century."
  }
]
```

### Multi-Select Questions

For questions with multiple correct answers, separate them with commas:

```json
{
  "question": "Which are primary colors? (Choose 2)",
  "options": ["Red", "Green", "Blue", "Purple"],
  "correct_answer": "Red, Blue",
  "explanation": "Red and blue are primary colors, along with yellow."
}
```

### Full Example

```json
[
  {
    "question": "Which AWS service provides managed Kubernetes?",
    "options": ["Amazon ECS", "Amazon EKS", "AWS Fargate", "AWS Lambda"],
    "correct_answer": "Amazon EKS",
    "explanation": "Amazon Elastic Kubernetes Service (EKS) is a managed Kubernetes service."
  },
  {
    "question": "Select all AWS compute services. (Choose 2)",
    "options": ["EC2", "S3", "Lambda", "RDS"],
    "correct_answer": "EC2, Lambda",
    "explanation": "EC2 provides virtual servers and Lambda provides serverless compute."
  }
]
```

## Custom Domain

To use a custom domain with GitHub Pages:

1. Create a file named `CNAME` in the `client/public` folder with your domain:
   ```
   yourdomain.com
   ```
2. Configure your DNS to point to GitHub Pages
3. Enable HTTPS in your repository's Pages settings

## Adding Question Banks

### Method 1: Add Files to Bank Folder (Recommended)

1. Create a JSON file in the `bank` folder (e.g., `bank/my-questions.json`)
2. Follow the format in `bank/README.md`
3. Restart the server - the question bank will be automatically loaded

### Method 2: Upload via UI

1. Click the "Upload Question Bank" card on the dashboard
2. Select a JSON file from your computer
3. The questions will be saved to local storage

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run normalize-banks` - Convert question banks to standard format
- `npm run check` - Type check with TypeScript

## Local Development

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5000`.

## API Endpoints

- `GET /api/question-banks` - Get all question banks from the bank folder
- `GET /api/question-banks/:id` - Get a specific question bank by ID

## Technology Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- Recharts for data visualization
- Vite for building
- Local Storage for data persistence

## License

MIT
