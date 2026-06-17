# Dialogflow CX E2E Tester

An automated end-to-end testing tool for Dialogflow CX agents. It sends text turns to a live agent, inspects the responses, and asserts against the current page, session parameters, and response text.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) — used for authentication
- Access to the target GCP project and Dialogflow CX agent

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Authenticate with Google Cloud

The client uses [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials). Log in with your Google account:

```bash
gcloud auth application-default login
```

Make sure your account has the **Dialogflow API Client** role (or equivalent) on the target project.

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .example.env .env
```

| Variable             | Description                                           |
|----------------------|-------------------------------------------------------|
| `AGENT_ID`           | The Dialogflow CX agent UUID                          |
| `PROJECT_ID`         | GCP project ID                                        |
| `LOCATION`           | Agent region (e.g. `global`, `europe-west2`)          |
| `TEST_POLICY_NUMBER` | A valid policy number used in IDV test scenarios      |
| `TEST_POSTCODE`      | A valid postcode used in IDV test scenarios           |

---

## Running the tests

```bash
npm start
```

To enable verbose Dialogflow API response logging, pass the `--debug` flag:

```bash
npm start -- --debug
```

The runner prints a summary at the end showing how many tests passed and failed. It exits with code `1` if any test fails.

---

## Adding your own tests

Tests are organised into **test groups** — each group is a TypeScript file in `src/test-groups/`.

### 1. Create a new test group file

Create `src/test-groups/test.group-3.ts` (or any name following the convention):

```ts
import { Test } from "../helpers/test.helper";
import { runTest } from "../main";

export async function testGroup3() {
  console.log("\n📋  Group 3: My new tests\n");

  await runTest("1. Bot greets the user", async () => {
    const test = await Test.init();

    await test.say(""); // same as no input

    test.assertContains(
      test.getLastResult(),
      "I didn't catch that. In a few words please tell me the reason for your call.",
    );
  });
}
```

Each call to `runTest` takes a name and an async function. Throwing (or failing an `assert`) marks the test as failed.

### 2. Register the group in `src/main.ts`

Import and call your new group function:

```ts
import { testGroup3 } from "./test-groups/test.group-3";

// inside main():
await testGroup3();
```

### Test helpers

The `Test` class (in `src/helpers/test.helper.ts`) provides the following helpers:

| Method | Description |
|---|---|
| `Test.init()` | Starts a new Dialogflow session (sends an initial "Hi" to trigger the welcome intent) |
| `test.say(text)` | Sends a text turn to the agent and stores the result |
| `test.getLastResult()` | Returns the `TurnResult` from the most recent `say()` call |
| `test.getSessionInfo()` | Returns the session parameters from the last result as a flat object |
| `test.assertContains(result, fragment)` | Asserts that the response text contains the given string (case-insensitive) |
| `test.assertCurrentPage(pageName)` | Asserts that the agent is on the named page |
| `test.assertParam(condition, message)` | Generic boolean assertion with a custom message |
| `test.getReportingParams()` | Returns all session parameters whose keys include `reporting_` |
