import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = process.env.Model_Name || 'gemini-2.5-flash-lite';
const previewInstructions = `
**Objective:** Process Quran memorization plan parameters (input as JSON) and **your entire response must be a single, valid JSON string** containing calculation details, estimated completion date, and a CSV preview of the first cycle. Do not output any other text, explanations, or code.

**Your Instructions:**

1.  **Input Processing:**
    *   You will receive plan parameters as a JSON object in the fixed format specified below.
    *   Parse this JSON object accurately to extract all parameters. Let \`params\` be the parsed JSON object.
2.  **Core Calculations (Perform Silently & Accurately):**
    *   Convert \`params.startUnit\` and \`params.endUnit\` to linear numbers (if \`params.memorizationUnit\` is "Thomn", use (H-1)*8+T; if "Page", use the number directly from the string). Let these be \`Starting_Linear_Unit\` and \`Ending_Linear_Unit\`.
    *   Calculate \`Total_Units = Ending_Linear_Unit - Starting_Linear_Unit + 1\`.
    *   \`Days_Per_Full_Cycle = params.memorizationDaysPerCycle + params.revisionDaysPerCycle + params.restDaysPerCycle\`.
    *   \`Total_Cycles_Float = Total_Units / params.memorizationDaysPerCycle\`.
    *   \`Total_Days_for_Memorization_Exact = Total_Cycles_Float * Days_Per_Full_Cycle\`.
    *   \`Estimated_Completion_Date_String = params.startDate (as Date) + floor(Total_Days_for_Memorization_Exact - 1) days\`, formatted as "YYYY-MM-DD".
    *   \`Total_Cycles_Display = ceil(Total_Units / params.memorizationDaysPerCycle)\`.
    *   \`Total_Days_for_Memorization_Display = Total_Cycles_Display * Days_Per_Full_Cycle\`.
3.  **Daily Plan Generation Logic (for Preview CSV):**
    *   Generate data for **exactly one full, typical cycle** based on \`params\`.
    *   If \`Total_Units\` is less than \`params.memorizationDaysPerCycle\`, generate data for all \`Total_Units\`.
    *   **One Cycle Consists of:**
        1.  **Memorization Segment (\`params.memorizationDaysPerCycle\` days):**
            *   Day 1: \`Memorize\` (1st new unit of block). \`Start\`/\`End\` = new unit.
            *   Days 2 to \`params.memorizationDaysPerCycle\`: \`Memorize+Revise\` (new unit for the day + revise block from 1st new unit up to current day's new unit). \`Start\` = 1st new unit of block, \`End\` = current day's new unit.
        2.  **Revision Segment (\`params.revisionDaysPerCycle\` days):**
            *   Each day: \`Revise\` (entire block of \`params.memorizationDaysPerCycle\` units memorized in this cycle's memorization segment). \`Start\` = 1st unit of block, \`End\` = last unit of block.
        3.  **Rest Segment (\`params.restDaysPerCycle\` days):**
            *   Each day: \`Rest\`. \`Start\`/\`End\` = -.
    *   Format units back to HxTy or page number for CSV output based on \`params.memorizationUnit\`.
4.  **Output Generation (Single JSON String Response):**
    *   **A. Generate Preview CSV String:** Create a CSV string for the preview data generated in step 3. Header: \`Date,Task,From,To\`.
    *   **B. Construct and Output JSON String:** Your **entire and only response** must be a single, valid JSON string with the following structure. Populate it with the calculated values:
        \`\`\`json
        {
          "calculationDetails": {
            "startingUnitInput": "[params.startUnit]",
            "startingUnitLinear": "[Starting_Linear_Unit]",
            "endingUnitInput": "[params.endUnit]",
            "endingUnitLinear": "[Ending_Linear_Unit]",
            "totalUnitsToMemorize": "[Total_Units]",
            "unitsPerCycleBlock": "[params.memorizationDaysPerCycle]",
            "revisionDaysPerCycle": "[params.revisionDaysPerCycle]",
            "restDaysPerCycle": "[params.restDaysPerCycle]",
            "totalDaysPerFullCycle": "[Days_Per_Full_Cycle]",
            "totalCyclesNeeded": "[Total_Cycles_Display]",
            "totalDaysForMemorization": "[Total_Days_for_Memorization_Display]"
          },
          "estimatedCompletionDate": "[Estimated_Completion_Date_String]",
          "previewCSV": "[String containing the generated CSV preview for 1 cycle]"
        }
        \`\`\`
        (Ensure all string values within the JSON are properly quoted, and numbers are not. The \`previewCSV\` value itself will be a string, potentially containing escaped newlines if your CSV is multi-line.)

**User Input:**
`;

const fullPlanInstructions = `
**Objective:** Process Quran memorization plan parameters (input as JSON) and **your entire response must be a single, valid JSON string containing only the full plan CSV**. Do not output any other text, explanations, or code.

**Your Instructions:**

1. **Input Processing:**
   - You will receive plan parameters as a JSON object in the fixed format specified below.
   - Parse this JSON object accurately to extract all parameters. Let \`params\` be the parsed JSON object.

2. **Core Calculations (Perform Silently & Accurately for Plan Generation):**
   - Convert \`params.startUnit\` and \`params.endUnit\` to linear numbers:
     - If \`params.memorizationUnit\` is "Thomn", use (H - 1) * 8 + T.
     - If "Page", use the number directly.
   - Let these be \`Starting_Linear_Unit\` and \`Ending_Linear_Unit\`.
   - Calculate \`Total_Units = Ending_Linear_Unit - Starting_Linear_Unit + 1\`.

3. **Daily Plan Generation Logic (for Full Plan CSV):**
   - Generate data for the **entire memorization plan** using the following cycle logic:
   
   - **Each Cycle Consists of:**
     1. **Memorization Segment (\`params.memorizationDaysPerCycle\` days):**
        - Day 1: \`Memorize\` → memorize 1st new unit. \`From = To = that unit\`.
        - Days 2 to N: \`Memorize+Revise\` → memorize new unit of the day, and **revise only units memorized in this cycle so far**.
          - \`From = first unit of current cycle block\`
          - \`To = today’s new unit in this cycle\`

     2. **Revision Segment (\`params.revisionDaysPerCycle\` days):**
        - Each day: \`Revise\` → revise only the **current cycle’s block**.
          - \`From = first unit of current cycle block\`
          - \`To = last unit of current cycle block\`

     3. **Rest Segment (\`params.restDaysPerCycle\` days):**
        - Each day: \`Rest\`. \`From\` and \`To\` = "-".

   - **Final (Partial) Cycle:** If remaining units < \`params.memorizationDaysPerCycle\`, shorten the memorization segment. Apply the same logic for revise/rest as usual.

   - Format all unit numbers back to:
     - HxTy if \`params.memorizationUnit\` is "Thomn".
     - Page number string if \`params.memorizationUnit\` is "Page".

4. **Output Generation (Single JSON String with Full Plan CSV):**
   - **A. CSV Format:** \`Date,Task,From,To\`
   - **B. Final Output Format:**
   In Rest days, set both "From" and "To" to "-", not just one.

   \`\`\`json
   {
     "planCSV": "[String containing the generated CSV for the full plan]"
   }
   \`\`\`
   - Ensure the CSV string is valid, JSON-safe, and escaped correctly for newlines.

**User Input:**
`;

function cleanupResponse(raw) {
    try {
        let cleaned = raw
            .replace(/^```json\s*/i, '')
            .replace(/```$/g, '')
            .trim();
        try {
            return JSON.parse(cleaned);
        } catch (firstError) {
            console.warn("First parse attempt failed:", firstError.message);
            cleaned = cleaned.replace(/"(?:[^"\\]|\\.)*?"/gs, (match) => {
                return match.replace(/\n/g, '\\n');
            });
            try {
                return JSON.parse(cleaned);
            } catch (finalError) {
                console.error("Failed to parse JSON after escaping:", finalError.message);
                return null;
            }
        }
    } catch (e) {
        console.error("Unexpected error during cleanup:", e);
        return null;
    }
}

const gptService = {
    getPreviewPlan: async (userInput) => {
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: {
                thinkingConfig: {
                    thinkingBudget: 0,
                },
            },
        });

        const prompt = previewInstructions + userInput;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const cleanResponse = cleanupResponse(response.text());
        return cleanResponse;
    },

    getFullPlan: async (userInput) => {
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: {
                thinkingConfig: {
                    thinkingBudget: 0,
                },
            },
        });

        const prompt = fullPlanInstructions + userInput;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const cleanResponse = cleanupResponse(response.text());
        return cleanResponse;
    },
};

export default gptService;