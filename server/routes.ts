import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all question banks from the bank folder
  app.get("/api/question-banks", async (_req, res) => {
    try {
      const bankDir = path.join(__dirname, "..", "bank");
      const files = await fs.readdir(bankDir);
      const jsonFiles = files.filter(file => file.endsWith(".json"));
      
      const banks = await Promise.all(
        jsonFiles.map(async (file) => {
          const filePath = path.join(bankDir, file);
          const content = await fs.readFile(filePath, "utf-8");
          const data = JSON.parse(content);
          
          // Ensure the bank has an id
          if (!data.id) {
            data.id = file.replace(/\.json$/i, "");
          }
          
          // Ensure dateAdded exists
          if (!data.dateAdded) {
            const stats = await fs.stat(filePath);
            data.dateAdded = stats.mtime.toISOString();
          }
          
          return data;
        })
      );
      
      res.json(banks);
    } catch (error) {
      console.error("Error loading question banks:", error);
      res.status(500).json({ error: "Failed to load question banks" });
    }
  });

  // Get a specific question bank by ID
  app.get("/api/question-banks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const bankDir = path.join(__dirname, "..", "bank");
      const files = await fs.readdir(bankDir);
      
      // Try to find the file by ID
      const matchingFile = files.find(file => {
        const fileId = file.replace(/\.json$/i, "");
        return fileId === id || file === `${id}.json`;
      });
      
      if (!matchingFile) {
        return res.status(404).json({ error: "Question bank not found" });
      }
      
      const filePath = path.join(bankDir, matchingFile);
      const content = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(content);
      
      // Ensure the bank has an id
      if (!data.id) {
        data.id = matchingFile.replace(/\.json$/i, "");
      }
      
      // Ensure dateAdded exists
      if (!data.dateAdded) {
        const stats = await fs.stat(filePath);
        data.dateAdded = stats.mtime.toISOString();
      }
      
      res.json(data);
    } catch (error) {
      console.error("Error loading question bank:", error);
      res.status(500).json({ error: "Failed to load question bank" });
    }
  });

  return httpServer;
}
