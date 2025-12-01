import { build as viteBuild } from "vite";
import react from "@vitejs/plugin-react";
import { rm, cp } from "fs/promises";
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

  console.log("Static build complete! Output: dist/public");
  console.log("\nTo test locally:");
  console.log("  npx serve dist/public");
  console.log("\nTo deploy to GitHub Pages:");
  console.log("  Push to main/master branch - GitHub Actions will handle deployment");
}

buildStatic().catch((err) => {
  console.error(err);
  process.exit(1);
});
