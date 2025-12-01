# Exam Practice Portal

A fully static exam and practice website that can be deployed on GitHub Pages. Load custom question banks from JSON files, take exams or practice with instant feedback, and track your progress over time.

## Features

- **Multiple Question Banks**: Upload your own JSON question files or use pre-built sample sets
- **Exam Mode**: Timed exam experience with question navigation and submit functionality
- **Practice Mode**: Instant feedback after each question with explanations
- **Progress Tracking**: View attempt history, scores, and performance trends
- **Local Storage**: All data persists in your browser - no server required
- **Dark/Light Mode**: Toggle between themes for comfortable studying
- **Responsive Design**: Works on desktop and tablet devices

## Deploying to GitHub Pages

### Automatic Deployment

1. Push this repository to GitHub
2. Go to your repository **Settings** > **Pages**
3. Under "Build and deployment", select **GitHub Actions** as the source
4. Push any changes to the `main` or `master` branch to trigger a deployment
5. Your site will be available at `https://<username>.github.io/<repository-name>/`

### Manual Build

To build the static site locally:

```bash
npm install
npx tsx script/build-static.ts
```

The output will be in the `dist/public` directory.

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

## Local Development

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5000`.

## Technology Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- Recharts for data visualization
- Vite for building
- Local Storage for data persistence

## License

MIT
