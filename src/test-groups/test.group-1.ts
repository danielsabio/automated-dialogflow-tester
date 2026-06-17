import assert from "node:assert";
import { Test } from "../helpers/test.helper";
import { runTest } from "../main";

export async function testGroup1() {
  console.log("\n📋  Group 1: Agent Handler — speak-to-agent intent\n");

  await runTest(
    "1. plays deflection message and stays on current page",
    async () => {
      const test = await Test.init();

      await test.say("I want to speak to an agent");

      const sessionInfo = await test.getSessionInfo();

      test.assertContains(test.getLastResult(), "I'm here to help");
      test.assertParam(
        sessionInfo.agent_requested === true,
        "Expected agent_requested=true in session parameters",
      );
      test.assertCurrentPage("decision_point");
    },
  );

  await runTest(
    "2. ask for agent 2 times across the call - not consecutively: transfers to escalate page",
    async () => {
      const test = await Test.init();

      await test.say("speak to agent"); // 1st ask — deflect
      await test.say("I have a leaking pipe inside");
      await test.say("inside");
      await test.say("yes");
      await test.say("yes");
      await test.say("yes");
      await test.say(process.env.TEST_POLICY_NUMBER + "");

      await test.say("speak to agent"); // 2nd ask — transfer

      const sessionInfo = await test.getSessionInfo();
      const result = test.getLastResult();

      assert(
        result.currentPage === "escalate",
        `Expected to reach the "escalate" page (Transfer flow), ` +
          `got page="${result.currentPage}" flow="${result.currentFlow}"`,
      );
      assert(
        sessionInfo.escalate === "true",
        "Expected escalate=true in session parameters",
      );
      assert(
        sessionInfo.stop_recording === "true",
        "Expected stop_recording=true in session parameters",
      );
      assert(
        sessionInfo.reporting_transfer_attempted === true,
        "Expected reporting_transfer_attempted=true in session parameters",
      );
    },
  );

  await runTest(
    "3. ask for agent 2 times across the call - not consecutively: transfers to escalate page",
    async () => {
      const test = await Test.init();

      await test.say("speak to agent"); // 1st ask — deflect
      await test.say("I have a leaking pipe inside");
      await test.say("inside");
      await test.say("yes");
      await test.say("yes");
      await test.say("yes");
      await test.say(process.env.TEST_POLICY_NUMBER + ""); // ID&V provide policy number

      await test.say("yes"); // ID&V confirm post code

      const result = test.getLastResult();
      const reporting_params = test.getReportingParams();
      console.log(result.currentPage);
      console.log(reporting_params);
    },
  );
}
