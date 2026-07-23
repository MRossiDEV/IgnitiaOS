// ======================================================
// Claude JSON Parser
// ======================================================

export function parseClaudeJSON<T>(

    text:string

):T{

    const cleaned = text

        .replace(/```json/g,"")

        .replace(/```/g,"")

        .trim();

    try{

        return JSON.parse(cleaned);

    }

    catch{

        console.error(cleaned);

        throw new Error(
            "Claude returned invalid JSON."
        );

    }

}