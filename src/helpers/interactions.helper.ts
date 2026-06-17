import { v4 as uuidv4 } from "uuid";
import { client } from "../client";

const LANGUAGE_CODE = "en-GB";
const DEBUG = process.argv.includes("--debug");

export function newSessionPath(): string {
  return client.projectLocationAgentSessionPath(
    process.env.PROJECT_ID ?? "homeserve-cca-uk-cisco-prod",
    process.env.LOCATION ?? "global",
    process.env.AGENT_ID!,
    uuidv4(),
  );
}

type QueryInput = { text: { text: string } } | { event: { event: string } };

export interface TurnResult {
  currentPage: string;
  currentFlow: string; // empty string when inside a playbook — expected behaviour
  responseText: string[];
  parameters: {
    fields: Record<string, unknown>;
  };
}

export async function sayResponse(
  session: string,
  text: string,
): Promise<TurnResult> {
  return sendTurn(session, { text: { text } });
}

export async function sendTurn(
  session: string,
  input: QueryInput,
): Promise<TurnResult> {
  const [response] = await client.detectIntent({
    session,
    queryInput: { ...input, languageCode: LANGUAGE_CODE },
  });

  const qr = response.queryResult as Record<string, unknown>;

  if (DEBUG) {
    console.log("\n--- RAW queryResult ---");
    console.log(JSON.stringify(qr, null, 2));
    console.log("--- END ---\n");
  }

  const currentPage =
    (qr?.currentPage as { displayName?: string })?.displayName ?? "";

  // currentFlow.displayName is not reliably populated by the API (it is empty
  // when inside a playbook). We keep it as-is — tests should not rely on it
  // for transfer detection; use currentPage = "escalate" instead.
  const currentFlow =
    (qr?.currentFlow as { displayName?: string })?.displayName ?? "";

  const responseText = (
    (qr?.responseMessages as Array<{ text?: { text?: string[] } }>) ?? []
  )
    .flatMap((m) => m.text?.text ?? [])
    .filter(Boolean);

  // The JS client deserialises google.protobuf.Struct to a plain JS object.
  const parameters = (qr?.parameters ?? {}) as {
    fields: Record<string, unknown>;
  };

  return { currentPage, currentFlow, responseText, parameters };
}

export async function startSession(): Promise<{
  session: string;
  welcome: TurnResult;
}> {
  const session = newSessionPath();
  // Sending text to a new session triggers the Default Welcome Intent,
  // matching how the CX Console simulator starts a conversation.
  const welcome = await sendTurn(session, { text: { text: "Hi" } });
  return { session, welcome };
}
