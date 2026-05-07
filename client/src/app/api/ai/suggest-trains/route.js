import { NextResponse } from "next/server";
import { getAllTrains } from "@/utils/trainData";
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // ✅ correct model name


export async function POST(req) {
  try {
    const body = await req.json();
    const userInput = body.input?.trim();

    if (!userInput) {
      return NextResponse.json({ error: "Missing user input" }, { status: 400 });
    }

  

    // Step 1️⃣ Extract travel details
    const extractionPrompt = `
You are an AI assistant that extracts train booking details.

Return only valid JSON in this format:
{
  "source": "string",
  "destination": "string",
  "date": "YYYY-MM-DD or 'tomorrow'",
  "coachType": "string"
}

User input: "${userInput}"
    `;

    const extractRes = await model.generateContent(extractionPrompt);
    const extractText = await extractRes.response.text();

    const cleanText = extractText.replace(/```json|```/g, "").trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not extract travel info", raw: cleanText }, { status: 400 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const { source, destination, date, coachType } = parsed;

    if (!source || !destination) {
      return NextResponse.json({ error: "Missing source or destination", parsed }, { status: 400 });
    }

    // Step 2️⃣ Fetch matching trains
    const allTrains = await getAllTrains();
    const matchingTrains = allTrains.filter((train) => {
      if (!train.routes || !Array.isArray(train.routes)) return false;

      const routeNames = train.routes.map((r) => r?.routeName?.toLowerCase().trim()).filter(Boolean);
      const srcIndex = routeNames.indexOf(source.toLowerCase().trim());
      const destIndex = routeNames.indexOf(destination.toLowerCase().trim());

      if (srcIndex === -1 || destIndex === -1 || srcIndex >= destIndex) return false;

      if (coachType) {
        const hasCoach = train.coaches?.some((coach) =>
          coach.coachType?.toLowerCase().includes(coachType.toLowerCase())
        );
        if (!hasCoach) return false;
      }

      return true;
    });

    // Step 3️⃣ Generate natural reply
    let summaryPrompt;

    if (matchingTrains.length > 0) {
      const trainInfo = matchingTrains
        .map(
          (t) =>
            `${t.trainName} (${t.trainNo}) departing ${t.routes[0]?.departureTime} from ${t.start} and arriving at ${t.end} around ${t.routes[t.routes.length - 1]?.arrivalTime}`
        )
        .join("\n");

        summaryPrompt = `
        You are a friendly travel assistant.
        
        User asked: "${userInput}"
        
        Here are the matching trains:
        ${trainInfo}
        
        Now reply naturally like a human assistant, e.g.:
        "Sure! For tomorrow, there are 3 trains from Jhansi to Delhi in AC class — including Secunderabad Express at 9:05 AM."
        
        Make it polite, conversational, and slightly descriptive.
          `;
        } else if (userInput) {
          summaryPrompt = `
        User asked: "${userInput}"
        
        No matching trains were found.
        
        Reply naturally, like:
        "Sorry, I couldn't find any trains from Jhansi to Delhi in AC class for tomorrow. Would you like me to search for another date or class?"
          `;
        } else {
          // 🟢 NEW CASE: When no user input is provided
          summaryPrompt = `
        You are a friendly AI travel assistant.
        
        The user hasn’t given any query or input yet.
        
        Kindly start the conversation in a natural way, for example:
        "Hi there! 👋 I'm your travel assistant. I can help you find or book trains. Where would you like to travel today?"
        
        Keep it short, warm, and inviting.
          `;
        }

    const summaryRes = await model.generateContent(summaryPrompt);
    const replyText = await summaryRes.response.text();

    return NextResponse.json({
      aiResponse: replyText.trim(),
      query: parsed,
      results: matchingTrains
      
    });
  } catch (error) {
    console.error("❌ API Failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
