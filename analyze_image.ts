import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No GEMINI_API_KEY found!");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const imagePath = path.join(process.cwd(), "src", "assets", "images", "kufulula_design_options_1780511171548.png");
  if (!fs.existsSync(imagePath)) {
    console.error("Image file does not exist at:", imagePath);
    process.exit(1);
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");

  console.log("Calling Gemini to analyze image and extract instructions...");
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: "This image contains mockups, design options, or instructions for improving the 'KUFULULA' e-commerce & escrow application in the Democratic Republic of Congo. Please perform OCR / extraction and detailed descriptions of all requested features, wireframes, design revisions, visual options, UX improvement requests, or copy updates shown in this image. Be extremely exact, thorough, and output every single instruction, text label, layout guidance, or feature detail you see, so that I can implement them perfectly."
          },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image
            }
          }
        ]
      }
    ]
  });

  console.log("Analysis Result:\n", response.text);
  fs.writeFileSync("extracted_instructions.txt", response.text || "No text returned");
  console.log("Saved to extracted_instructions.txt");
}

main().catch(console.error);
