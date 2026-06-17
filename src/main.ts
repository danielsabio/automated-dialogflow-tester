import "dotenv/config";
import { testGroup1 } from "./test-groups/test.group-1";
import { testGroup2 } from "./test-groups/test.group-2";

const PROJECT_ID = process.env.PROJECT_ID ?? "homeserve-cca-uk-cisco-prod";
const LOCATION = process.env.LOCATION ?? "global";
const AGENT_ID = process.env.AGENT_ID;
const TEST_POLICY_NUMBER = process.env.TEST_POLICY_NUMBER;
const DEBUG = process.argv.includes("--debug");

if (!AGENT_ID) {
  console.error("❌  AGENT_ID environment variable is required.");
  process.exit(1);
}

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

export async function runTest(name: string, fn: () => Promise<void>) {
  process.stdout.write(`  ⏳ ${name} ... `);
  try {
    await fn();
    console.log("✅  PASS");
    results.push({ name, passed: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`❌  FAIL\n     ${msg}`);
    results.push({ name, passed: false, error: msg });
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("  HomeServe UK — E2E Tests");
  console.log("=".repeat(60));
  console.log(`  Project:  ${PROJECT_ID}`);
  console.log(`  Location: ${LOCATION}`);
  console.log(`  Agent:    ${AGENT_ID}`);
  console.log(
    `  IDV data: ${TEST_POLICY_NUMBER ? "provided" : "not provided (Group 3 skipped)"}`,
  );
  if (DEBUG) console.log("  Debug:    ON");

  await testGroup1();
  await testGroup2();

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n" + "=".repeat(60));
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("=".repeat(60));

  if (failed > 0) {
    console.log("\n  Failed tests:");
    for (const r of results.filter((r) => !r.passed)) {
      console.log(`    ✗ ${r.name}`);
      console.log(`      ${r.error}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
