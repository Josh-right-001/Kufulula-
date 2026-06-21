import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set high limits for base64 images (KYC captures)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Google Gen AI lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARN: GEMINI_API_KEY is not defined in environment variables. Falling back to simulation mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health & Configuration status
app.get("/api/config", (req, res) => {
  res.json({
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    appUrl: process.env.APP_URL || "http://localhost:3000",
    currentTime: new Date().toISOString(),
  });
});

// 2. Gemini AI: Extract unstructured product data (Autonomous Supply Chain)
app.post("/api/gemini/extract", async (req: express.Request, res: express.Response) => {
  const { rawText } = req.body;
  
  if (!rawText || typeof rawText !== "string") {
    res.status(400).json({ error: "Missing required rawText field" });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Elegant Simulation fallback
    console.log("Simulating product extraction (Gemini Client unavailable)");
    setTimeout(() => {
      const isCdf = rawText.toLowerCase().includes("fc") || rawText.toLowerCase().includes("cdf") || rawText.toLowerCase().includes("franc");
      const matchedPrice = rawText.match(/\d+(\s*\$|\s*usd|\s*usd\b|\bcdf\b|\bfc\b)?/i);
      const price = matchedPrice ? parseInt(matchedPrice[0]) : 75;
      
      res.json({
        title: "Product " + Math.floor(Math.random() * 1000) + " - Custom",
        description: `High-quality extracted item from unstructured ingestion. Real info found: ${rawText.slice(0, 100)}...`,
        price: price || 90,
        currency: isCdf ? "CDF" : "USD",
        tags: ["ingested", "kufulula-ai", "congo-tech"],
        suggestedCategory: "Electronic",
        keySellingPoint: "Direct supply chain autonomy",
        imageGeneratorPrompt: "A sleek consumer electronic item, photorealistic, pristine studio lighting, crisp white background, premium shadows."
      });
    }, 1000);
    return;
  }

  try {
    const prompt = `You are an expert e-commerce logistician in DRC. Extract, translate, structure, and optimize the following raw unstructured text about a newly arrived product. Fill in the JSON schema precisely.
Raw text: "${rawText}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Format the output as valid JSON matching the specified schema. Keep product descriptions engaging and SEO-optimized.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { 
              type: Type.STRING, 
              description: "Optimized commercial headline title of the product in French or English" 
            },
            description: { 
              type: Type.STRING, 
              description: "Full SEO marketing copy written to present the product elegantly to customers" 
            },
            price: { 
              type: Type.INTEGER, 
              description: "The targeted or estimated product price as an integer" 
            },
            currency: { 
              type: Type.STRING, 
              enum: ["USD", "CDF"],
              description: "Detected currency. USD is the default, select CDF absolute if specified or local" 
            },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Set of relevant tag keywords for classification" 
            },
            suggestedCategory: { 
              type: Type.STRING, 
              description: "E-commerce category like Electronics, Fashion, Home, Sports, or Food" 
            },
            keySellingPoint: { 
              type: Type.STRING, 
              description: "A one-sentence punchy tagline highlighting the best feature of this item" 
            },
            imageGeneratorPrompt: { 
              type: Type.STRING, 
              description: "Highly detailed English prompt starting with 'Professional product shot of...', clean studio lighting, realistic details, neutral minimalist background for a photo generation tool" 
            },
          },
          required: ["title", "description", "price", "currency", "tags", "suggestedCategory", "keySellingPoint", "imageGeneratorPrompt"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini model");
    }

    const structuredData = JSON.parse(response.text.trim());
    res.json(structuredData);
  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    res.status(500).json({ error: error.message || "Failed to parse content via Gemini" });
  }
});

// Robust category extraction helper for Unsplash image simulation
function getSimulatedImageUrl(prompt: string): string {
  const p = prompt.toLowerCase();
  
  // Clothing / Couture / Fashion / Dress
  if (p.includes("couture") || p.includes("isolele") || p.includes("dress") || p.includes("fashion") || p.includes("clothing") || p.includes("robe") || p.includes("tissu") || p.includes("panthere") || p.includes("couturier")) {
    const fashionImages = [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566207274740-0f8cf6b7d5a5?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop"
    ];
    return fashionImages[Math.floor(Math.random() * fashionImages.length)];
  }
  
  // Food / Drink / Nourriture / Grain / Cafe
  if (p.includes("food") || p.includes("recipe") || p.includes("drink") || p.includes("nourriture") || p.includes("cafe") || p.includes("bread") || p.includes("pain") || p.includes("manioc") || p.includes("plat")) {
    const foodImages = [
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop"
    ];
    return foodImages[Math.floor(Math.random() * foodImages.length)];
  }

  // Home / Decor / Mobilier
  if (p.includes("decor") || p.includes("home") || p.includes("furniture") || p.includes("salon") || p.includes("maison") || p.includes("chaise") || p.includes("lit") || p.includes("canape")) {
    const homeImages = [
      "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581881067989-7e3eaf45f4f6?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800&auto=format&fit=crop"
    ];
    return homeImages[Math.floor(Math.random() * homeImages.length)];
  }

  // Book / Read / Document / Library
  if (p.includes("book") || p.includes("read") || p.includes("livre") || p.includes("bibliotheque") || p.includes("roman") || p.includes("document")) {
    const bookImages = [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop"
    ];
    return bookImages[Math.floor(Math.random() * bookImages.length)];
  }

  // Electronics / Tech / Cyber / Gadget
  if (p.includes("elec") || p.includes("phone") || p.includes("computer") || p.includes("ipad") || p.includes("tech") || p.includes("batterie") || p.includes("gadget")) {
    const elecImages = [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=600&q=80"
    ];
    return elecImages[Math.floor(Math.random() * elecImages.length)];
  }

  // Generic clean default
  return "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop";
}

// 3. Gemini AI / Imagen API: Generate product lookups or image generation
app.post("/api/gemini/generate-image", async (req: express.Request, res: express.Response) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Missing required prompt field" });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    // simulation fallback - using beautiful Unsplash links matching key product categories
    res.json({ imageUrl: getSimulatedImageUrl(prompt), simulated: true });
    return;
  }

  try {
    // Try using imagen model first
    try {
      const response = await ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: "1:1",
        },
      });
      
      if (response?.generatedImages?.[0]?.image?.imageBytes) {
        const base64 = response.generatedImages[0].image.imageBytes;
        res.json({ imageUrl: `data:image/jpeg;base64,${base64}` });
        return;
      }
    } catch (imagenErr: any) {
      console.warn("Imagen generation failed, falling back to gemini-2.5-flash-image:", imagenErr?.message || imagenErr);
    }

    // Try gemini-2.5-flash-image
    try {
      const imageResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [{ text: `${prompt}. High resolution product photography with clean neutral background.` }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          }
        }
      });

      const parts = imageResponse.candidates?.[0]?.content?.parts;
      let base64Image = "";
      if (parts) {
        for (const part of parts) {
          if (part.inlineData?.data) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      }

      if (base64Image) {
        res.json({ imageUrl: `data:image/png;base64,${base64Image}` });
        return;
      }
    } catch (flashErr: any) {
      console.warn("gemini-2.5-flash-image also failed, falling back to simulated imagery:", flashErr?.message || flashErr);
    }

    // High quality fallback on any generation failures
    console.log("Both image generation models failed or were throttled. Activating high-fidelity Unsplash simulation.");
    res.json({ imageUrl: getSimulatedImageUrl(prompt), simulated: true });
  } catch (error: any) {
    console.error("General image handler block went wrong, serving generic safe representation:", error);
    res.json({ imageUrl: getSimulatedImageUrl(prompt), simulated: true });
  }
});

// 4. Gemini AI: Compare facial documents vs live liveness snapshot (Biometric KYC)
app.post("/api/gemini/kyc-compare", async (req: express.Request, res: express.Response) => {
  const { docImage, selfieImage, documentType } = req.body;

  if (!docImage || !selfieImage) {
    res.status(400).json({ error: "Both docImage (ID card) and selfieImage (liveness) are required as base64 strings" });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    console.log("Simulating KYC geometry croisée (Gemini Client unavailable)");
    setTimeout(() => {
      res.json({
        isMatch: true,
        confidenceScore: 99.2,
        extractedName: "KABULO TSHIMANGA JEAN-PIERRE",
        extractedIdNumber: "ID-RDC-9082736-Z",
        analysisDetails: "Simulation - Facial metrics successfully verified. Dynamic liveness smile challenge matches perfect liveness standards."
      });
    }, 1200);
    return;
  }

  try {
    // Process base64 by removing headers if present
    const cleanDocBase64 = docImage.replace(/^data:image\/\w+;base64,/, "");
    const cleanSelfieBase64 = selfieImage.replace(/^data:image\/\w+;base64,/, "");

    const docPart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: cleanDocBase64,
      },
    };

    const selfiePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: cleanSelfieBase64,
      },
    };

    const textInstruction = {
      text: `You are the KUFULULA Core Biometric Trust Engine. Analyze these two security photos from a user checkout flow in the Democratic Republic of Congo (DRC):
1. Document Snapshot: An official identity document (${documentType || "ID Card / Passport"}) containing an official portrait.
2. Liveness Selfie: A real-time camera snapshot of the customer checkout facial liveness challenge.

YOUR MANDATE:
1. Extract the primary holder's FULL NAME (Nom et Post-nom) and DOCUMENT NUMBER from the identity document using state-of-the-art OCR.
2. Perform a multi-point facial geometric calculation between the portrait in the official document and the liveness selfie. Look at face structure, eye distances, nose bridges, and ear setups.
3. Compare the facial elements. Give an authenticated boolean match and a geometric similarity confidence rate between 80.0% and 99.9%.
4. Detect any signs of document tampering, digital screen re-photography, or physical prints masking.

Return your response strictly in the JSON schema defined.`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: {
        parts: [docPart, selfiePart, textInstruction]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isMatch: { 
              type: Type.BOOLEAN, 
              description: "True if the geometrical facial profiles belong to the same person with high certainty" 
            },
            confidenceScore: { 
              type: Type.NUMBER, 
              description: "Facial vector similarity score (percentage e.g., 98.7)" 
            },
            extractedName: { 
              type: Type.STRING, 
              description: "Extracted Full Name from the official document. Capitalized completely." 
            },
            extractedIdNumber: { 
              type: Type.STRING, 
              description: "Document identity registration/ID serial code extracted" 
            },
            analysisDetails: { 
              type: Type.STRING, 
              description: "Step-by-step summary of face geometry comparisons, liveness and document integrity indicators" 
            },
          },
          required: ["isMatch", "confidenceScore", "extractedName", "extractedIdNumber", "analysisDetails"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response from Gemini trust comparator");
    }

    const verificationResult = JSON.parse(response.text.trim());
    res.json(verificationResult);
  } catch (error: any) {
    console.error("Gemini KYC verification failed:", error);
    res.status(500).json({ error: error.message || "Facial KYC analysis failed" });
  }
});

// 5. Gemini AI / Google Lens integration for camera lookup
app.post("/api/gemini/lens", async (req: express.Request, res: express.Response) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    res.status(400).json({ error: "Missing required imageBase64 field" });
    return;
  }

  // Demonstration lens photo presets intercept
  if (imageBase64.startsWith("preset:")) {
    const presetId = imageBase64.replace("preset:", "").trim();
    let mockResult = {
      detectedCategory: "Electronics",
      primaryObject: "MWINDA Solaire Lantern v4",
      suggestedTags: ["Solar", "Solaire", "Power"],
      confidenceScore: 99.4,
      description: "Match visuel parfait : Lanterne solaire de confiance d'urgence Mwinda par rapport visuel."
    };
    
    if (presetId === "lens-coffee") {
      mockResult = {
        detectedCategory: "Food",
        primaryObject: "Pâtisserie du Fleuve",
        suggestedTags: ["Café", "Viennoiseries", "N'sele"],
        confidenceScore: 98.7,
        description: "Match visuel : Grains de café ou service de boulangerie fine de terroir."
      };
    } else if (presetId === "lens-fashion") {
      mockResult = {
        detectedCategory: "Fashion",
        primaryObject: "Fashion Isolele",
        suggestedTags: ["Pagne", "Cotton", "Wax"],
        confidenceScore: 97.9,
        description: "Match visuel : Article confectionné avec du tissu ou de l'habillement traditionnel."
      };
    } else if (presetId === "lens-book") {
      mockResult = {
        detectedCategory: "Livre",
        primaryObject: "La Dynastie Kongo",
        suggestedTags: ["Books", "History", "Kongo"],
        confidenceScore: 99.1,
        description: "Match visuel : Ouvrage historique relié ou roman d'aventures littéraires."
      };
    }
    
    res.json(mockResult);
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    // High fidelity simulator when Gemini key is not defined yet
    console.log("Simulating Gemini Lens Classifier (Gemini Client key missing)");
    setTimeout(() => {
      // Pick random category with high relevance
      const mockClassifications = [
        { category: "Electronics", title: "MWINDA Solar Lantern v3", tags: ["Solar", "Solaire", "Power"] },
        { category: "Food", title: "KASAI Custom Reserve Coffee", tags: ["Coffee", "Arabica", "Manioc"] },
        { category: "Fashion", title: "Super-Wax Block Congo Impérial", tags: ["Pagne", "Cotton", "Wax"] },
        { category: "Livre", title: "La Dynastie Kongo & ses Secrets", tags: ["Books", "History", "Kongo"] }
      ];
      const picked = mockClassifications[Math.floor(Math.random() * mockClassifications.length)];
      res.json({
        success: true,
        detectedCategory: picked.category,
        primaryObject: picked.title,
        suggestedTags: picked.tags,
        confidenceScore: 92.4,
        description: `Simulé par Kufulula Lens Engine: Objet détecté avec succès comme étant un article de type ${picked.category}.`
      });
    }, 1000);
    return;
  }

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: cleanBase64
      }
    };

    const textInstruction = {
      text: `You are the KUFULULA Core Google Lens & Gemini visual search matching engine.
Analyze this scanned image from a user's camera in the Democratic Republic of Congo (DRC).
Identify the main item or concept in the image and classify it precisely into one of our e-commerce categories:
"Electronics", "Food", "Fashion", "Home", or "Livre".

Provide an educated guess of the specific product title or general item description, tags, and a reliability confidence rate between 50% and 99.9%.
Your response must be returned strictly in the JSON schema defined.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: {
        parts: [imagePart, textInstruction]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedCategory: {
              type: Type.STRING,
              enum: ["Electronics", "Food", "Fashion", "Home", "Livre"],
              description: "The classified store category of the object"
            },
            primaryObject: {
              type: Type.STRING,
              description: "The concise name of the identified item (e.g., Solar lantern, print clothing, book, organic food)"
            },
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Extracted tag keywords for searching"
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: "Relevance score percentage"
            },
            description: {
              type: Type.STRING,
              description: "A friendly one-sentence description of what Google Lens detected in French"
            }
          },
          required: ["detectedCategory", "primaryObject", "suggestedTags", "confidenceScore", "description"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Lens analysis returned empty stream from Gemini model");
    }

    const lensResult = JSON.parse(response.text.trim());
    res.json({ success: true, ...lensResult });
  } catch (error: any) {
    console.error("Gemini Lens API error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze image content" });
  }
});

// 6. Gemini-powered Merchant Negotiation Chatbot
app.post("/api/gemini/negotiate", async (req: express.Request, res: express.Response) => {
  const { productId, title, originalPrice, vendor, currency, offerPrice, message, chatHistory } = req.body;

  if (!title || originalPrice === undefined || !vendor) {
    res.status(400).json({ error: "Missing required product title, originalPrice or vendor" });
    return;
  }

  const numericOriginalPrice = Number(originalPrice);
  const numericOfferPrice = Number(offerPrice);
  const curSymbol = currency === "CDF" ? "CDF" : "$";

  const ai = getGeminiClient();
  if (!ai) {
    // High fidelity simulator fallback
    console.log(`Simulating Gemini Merchant Chatbot: Vendor ${vendor} (Gemini Client key missing)`);
    setTimeout(() => {
      let status: "accepted" | "rejected" | "negotiating" = "negotiating";
      let counterOffer = Math.round(numericOriginalPrice * 0.85);
      let reply = "";

      const lowerLimit = numericOriginalPrice * 0.70;

      if (numericOfferPrice >= numericOriginalPrice) {
        status = "accepted";
        counterOffer = numericOriginalPrice;
        reply = `Toya ! C'est absolument magique, mon frère/ma sœur. ${numericOfferPrice} ${curSymbol} c'est un prix très respectueux pour le travail de ${vendor}. C'est d'accord ! On conclut l'affaire immédiatement, tu peux l'ajouter au panier ! Melesi mingi (Merci beaucoup) !`;
      } else if (numericOfferPrice >= lowerLimit) {
        status = "accepted";
        counterOffer = numericOfferPrice;
        reply = `Hmm, tu es un négociateur féroce ! C'est difficile pour moi de baisser de ${numericOriginalPrice} ${curSymbol} à ${numericOfferPrice} ${curSymbol}, mais comme on est ensemble et que Kufulula Séquestre sécurise notre Mobile Money direct, je valide ! Allez, accord conclu pour ${numericOfferPrice} ${curSymbol}. Commande maintenant avec confiance !`;
      } else if (numericOfferPrice >= numericOriginalPrice * 0.50) {
        status = "negotiating";
        counterOffer = Math.round(numericOriginalPrice * 0.80);
        reply = `Ah, ndeko (mon ami), ${numericOfferPrice} ${curSymbol} c'est vraiment serré pour ce produit de qualité supérieure. Faisons un pas l'un vers l'autre. Que dis-tu de couper la poire en deux à ${counterOffer} ${curSymbol} ? C'est honnête et tout le monde y gagne !`;
      } else {
        status = "rejected";
        counterOffer = Math.round(numericOriginalPrice * 0.85);
        reply = `Wapi ! Oza kosakana, mon frère/ma sœur (Rires) ! ${numericOfferPrice} ${curSymbol} pour un article qui vaut ${numericOriginalPrice} ${curSymbol} ? Tu veux que je dorme affamé ce soir ? Soyons sérieux, c'est impossible. Je peux descendre au grand maximum à ${counterOffer} ${curSymbol}. Qu'en penses-tu ?`;
      }

      res.json({
        success: true,
        reply,
        status,
        counterOffer
      });
    }, 1200);
    return;
  }

  try {
    const formattedHistory = (chatHistory || [])
      .map((h: any) => `${h.sender === "user" ? "Client" : "Vendeur"}: ${h.text}`)
      .join("\n");

    const textInstruction = {
      text: `You are Papa ${vendor}, a highly seasoned, welcoming, professional, and witty Congolese merchant in DRC.
You are selling "${title}" which has a standard/catalogue price of ${numericOriginalPrice} ${curSymbol}.
The customer has currently offered ${numericOfferPrice} ${curSymbol} for this item and accompanied it with this message: "${message || ""}".
Here is the previous chat conversation history between you:
${formattedHistory}

Your target/ideal lowest possible price is around 70% of the catalogue price (${Math.round(numericOriginalPrice * 0.7)} ${curSymbol}).
Please evaluate the offer and output your decision strictly in the required JSON schema with:
1. "reply": A professional, smart, and delightfully conversational response in French (incorporating natural Congolese terms of respect/endearment such as "Toya", "ndeko", "mwana mboka", "mon frère", "ma sœur", "melesi mingi", or "toyokana"). Make sure you represent the character of an experienced, fair-minded merchant who highlights the security of Kufulula double escrow logistique, and that you guide them gracefully to finalize the transaction.
2. "status":
   - "accepted": if the offer is >= 70% of the catalogue price (and if they have argued reasonably).
   - "negotiating": if the offer is less than 70% but greater than 50% of the original price, and you want to propose a specific friendly counter-proposal (say, midway/80%).
   - "rejected": if the offer is extremely low (less than 50% of original price) or completely unrealistic.
3. "counterOffer": Your specific proposed round-number counter price if the status is "negotiating" or "rejected" (e.g., if original is 100 and they offer 60, counter with 80). If accepted, match the customer's offered price.

Response must strictly match the JSON schema.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [textInstruction] },
      config: {
        systemInstruction: "You are the KUFULULA Core Real-time Bargaining Engine. Respond strictly in valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "The chat response from Papa the merchant in French with local Congo touches."
            },
            status: {
              type: Type.STRING,
              enum: ["accepted", "rejected", "negotiating"],
              description: "The negotiation decision outcome"
            },
            counterOffer: {
              type: Type.NUMBER,
              description: "A calculated round-number counter offer or agreed price"
            }
          },
          required: ["reply", "status", "counterOffer"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Chat negotiation returned empty stream from Gemini model");
    }

    const result = JSON.parse(response.text.trim());
    res.json({ success: true, ...result });

  } catch (error: any) {
    console.error("Gemini merchant negotiation error:", error);
    res.status(500).json({ error: error.message || "Failed to parse dialogue with Gemini merchant" });
  }
});


// 6b. General Congolese Merchant Chatbot
app.post("/api/gemini/merchant-chat", async (req: express.Request, res: express.Response) => {
  const { merchantName, userMessage, chatHistory } = req.body;

  if (!merchantName || !userMessage) {
    res.status(400).json({ error: "Missing merchantName or userMessage" });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Simulator fallback
    setTimeout(() => {
      let reply = "";
      const lowerName = merchantName.toLowerCase();
      if (lowerName.includes("elikya")) {
        reply = `Mbote ndeko (mon ami) ! C'est Papa Elikya de Kongo-Innovations. Melesi minkiri (merci beaucoup) pour ton message ! Ici, on travaille d'arrache-pied sur l'éclairage solaire MWINDA pour éclairer tout le Congo, de Kinshasa à Goma. Tu as des questions sur nos batteries solaires robustes ou sur la logistique sécurisée sous séquestre direct de Kufulula ? Pose-les moi librement, on est ensemble !`;
      } else if (lowerName.includes("kabasele")) {
        reply = `Nzolo na yo ! Salut digne ami, ici le vieux Papa Kabasele. Sais-tu que chaque Lukasa Ledger est sculpté patiemment à la main dans du wengé africain véritable et assemblé avec fierté à Lubumbashi ? C'est le mariage parfait de notre savoir-faire ancestral du Royaume et de la technologie moderne sécurisée. Dis-moi ce qui t'intéresse !`;
      } else if (lowerName.includes("mwasi") || lowerName.includes("coopérative")) {
        reply = `Jambo ! Mambo vipi ! C'est Maman Mwasi de la coopérative de pagnes Goma-Kinshasa. Nos tissus super-wax sont en pur coton égyptien fin doublé, garantis sans décoloration. Grâce au double séquestre de Kufulula, tu achètes sans crainte : l'argent reste bloqué jusqu'à ce que la livraison à ta porte soit inspectée et validée !`;
      } else if (lowerName.includes("augustin") || lowerName.includes("café")) {
        reply = `Mbote na yo ! C'est Papa Augustin. Notre café de spécialité Kasaï Reserve provient de petites exploitations paysannes de l'Équateur et des Kivu. En achetant chez nous, tu encourages le commerce équitable et responsable. Tout est sécurisé de bout en bout par Kufulula, donc tu es serein !`;
      } else {
        reply = `Mbote ! C'hui très heureux de bavarder avec toi. Nos produits sont 100% locaux, authentiques rattachés aux terroirs de la RDC, et garantis par l'écosystème de confiance Kufulula. Dis-moi, comment puis-je t'aider à sécuriser ton achat aujourd'hui ?`;
      }
      res.json({ success: true, reply });
    }, 1000);
    return;
  }

  try {
    const formattedHistory = (chatHistory || [])
      .map((h: any) => `${h.sender === "user" ? "Client" : "Marchand"}: ${h.text}`)
      .join("\n");

    const textInstruction = {
      text: `You are ${merchantName}, a real-life, character-rich Congolese merchant or artisan in the KUFULULA Trust Marketplace (DRC).
Here is the message from the user: "${userMessage}".
Here is what you talked about before:
${formattedHistory}

Answer the user directly and warmly in conversational French, injecting natural Congolese expressions (Lingala, Swahili, Kikongo, or Tshiluba depending on your character role and background). Make sure to be incredibly helpful, explain how Kufulula double escrow mobile money secures the local trust, and praise the craftsmanship of Congolese goods. Stand by your proud local identity! Return your reply strictly inside the expected JSON structure.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [textInstruction] },
      config: {
        systemInstruction: "You are the conversational agent for KUFULULA local DRC marketplace merchants. Respond strictly in valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "The chat response in conversational French with Congolese flavors."
            }
          },
          required: ["reply"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Chat api returned empty content");
    }

    const result = JSON.parse(response.text.trim());
    res.json({ success: true, reply: result.reply });
  } catch (error: any) {
    console.error("General chat error:", error);
    res.status(500).json({ error: error.message || "Failed to talk with merchant" });
  }
});


// ----------------------------------------------------
// DEV/PRODUCTION HANDLER & VITE MIDDLEWARE
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Setup Vite dynamically for Dev to prevent any module resolution errors or fileURLToPath crashes in production containers
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve Static files in Production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[KUFULULA CORE ENGINE] Server booted! Port: ${PORT}`);
  });
}

startServer();
