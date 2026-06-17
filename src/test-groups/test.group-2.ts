import { Test } from "../helpers/test.helper";
import { runTest } from "../main";

export async function testGroup2() {
  console.log("\n📋  Group 2: Test the Test class\n");

  await runTest("1. Escalate after requesting an agent twice.", async () => {
    const test1 = await Test.init();
    await test1.say("I want to speak to an agent");
    await test1.say("speak to an agent");

    const sessionInfo = await test1.getSessionInfo();

    test1.assertParam(
      sessionInfo.agent_requested === true,
      "Expected agent_requested=true in session parameters",
    );

    test1.assertCurrentPage("escalate");

    test1.assertContains(
      test1.getLastResult(),
      "I'll connect you to a team member who can help.",
    );
  });
}
