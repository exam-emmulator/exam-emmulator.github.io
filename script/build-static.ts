import { build as viteBuild } from "vite";
import react from "@vitejs/plugin-react";
import { rm, cp, readdir, readFile, writeFile, mkdir } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

async function buildStatic() {
  const distDir = resolve(projectRoot, "dist/public");
  
  await rm(distDir, { recursive: true, force: true });

  console.log("Building static site for GitHub Pages...");
  
  await viteBuild({
    plugins: [react()],
    root: resolve(projectRoot, "client"),
    base: "./",
    resolve: {
      alias: {
        "@": resolve(projectRoot, "client", "src"),
        "@shared": resolve(projectRoot, "shared"),
        "@assets": resolve(projectRoot, "attached_assets"),
      },
    },
    build: {
      outDir: distDir,
      emptyOutDir: true,
    },
  });

  const indexPath = resolve(distDir, "index.html");
  const notFoundPath = resolve(distDir, "404.html");
  
  try {
    if (existsSync(indexPath)) {
      await cp(indexPath, notFoundPath);
      console.log("Created 404.html for GitHub Pages SPA routing");
    }
  } catch (err) {
    console.error("Failed to create 404.html:", err);
  }

  // Copy bank folder and create manifest
  console.log("\nProcessing question banks...");
  const bankDir = resolve(projectRoot, "bank");
  const distBankDir = resolve(distDir, "bank");
  
  try {
    await mkdir(distBankDir, { recursive: true });
    
    const files = await readdir(bankDir);
    const jsonFiles = files.filter(file => file.endsWith(".json"));
    const banks: any[] = [];
    
    for (const file of jsonFiles) {
      const sourcePath = resolve(bankDir, file);
      const destPath = resolve(distBankDir, file);
      
      // Read and parse the bank file
      const content = await readFile(sourcePath, "utf-8");
      const bank = JSON.parse(content);
      
      // Ensure id and dateAdded exist
      if (!bank.id) {
        bank.id = file.replace(/\.json$/i, "");
      }
      if (!bank.dateAdded) {
        bank.dateAdded = new Date().toISOString();
      }
      
      // Copy the file
      await writeFile(destPath, JSON.stringify(bank, null, 2));
      
      // Add to manifest (without questions to keep it small)
      banks.push({
        id: bank.id,
        name: bank.name,
        description: bank.description,
        dateAdded: bank.dateAdded,
        questionCount: bank.questions?.length || 0,
        file: file
      });
      
      console.log(`  ✓ Copied ${file} (${bank.questions?.length || 0} questions)`);
    }
    
    // Create manifest file
    const manifestPath = resolve(distBankDir, "manifest.json");
    await writeFile(manifestPath, JSON.stringify(banks, null, 2));
    console.log(`  ✓ Created manifest.json with ${banks.length} bank(s)`);
    
  } catch (err) {
    console.error("Failed to process question banks:", err);
  }

  console.log("\nStatic build complete! Output: dist/public");
  console.log("\nTo test locally:");
  console.log("  npx serve dist/public");
  console.log("\nTo deploy to GitHub Pages:");
  console.log("  Push to main/master branch - GitHub Actions will handle deployment");
}

buildStatic().catch((err) => {
  console.error(err);
  process.exit(1);
});
