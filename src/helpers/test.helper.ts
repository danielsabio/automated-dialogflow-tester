import assert from "node:assert";
import { sendTurn, startSession, TurnResult } from "./interactions.helper";
import { getSessionInfo } from "./session.helper";

export function assertContains(arr: string[], fragment: string) {
  assert(
    arr.some((s) => s.toLowerCase().includes(fragment.toLowerCase())),
    `Expected response to contain "${fragment}" but got: ${JSON.stringify(arr)}`,
  );
}

export class Test {
  public session: string;
  public results: TurnResult[] = [];
  constructor(session: string) {
    this.session = session;
  }

  static async init() {
    const { session } = await startSession();
    return new Test(session);
  }

  async say(text: string) {
    const result = await sendTurn(this.session, {
      text: { text },
    });
    this.results.push(result);
  }

  getLastResult() {
    if (this.results.length === 0) {
      throw new Error("No results available. Call say() first.");
    }
    return this.results[this.results.length - 1];
  }

  getSessionInfo() {
    const lastResult = this.getLastResult();
    if (!lastResult) {
      throw new Error("No results available to extract session info from.");
    }
    return getSessionInfo(lastResult);
  }

  assertParam(condition: boolean, message: string) {
    assert(condition, message);
  }

  assertCurrentPage(expectedPage: string) {
    const lastResult = this.getLastResult();
    const currentPage = lastResult?.currentPage;
    assert(
      currentPage === expectedPage,
      `Expected current page to be "${expectedPage}" but got "${currentPage}"`,
    );
  }

  assertContains(result: TurnResult, fragment: string) {
    const arr = result?.responseText ?? [];
    assert(
      arr.some((s) => s.toLowerCase().includes(fragment.toLowerCase())),
      `Expected response to contain "${fragment}" but got: ${JSON.stringify(arr)}`,
    );
  }

  getReportingParams() {
    const lastResult = this.getLastResult();
    if (!lastResult) {
      throw new Error("No results available to extract reporting params from.");
    }
    const sessionInfo = getSessionInfo(lastResult);
    let reporting_params: Record<string, unknown> = {};
    for (const key of Object.keys(sessionInfo)) {
      if (key.includes("reporting_")) {
        reporting_params[key] = sessionInfo[key];
      }
    }

    return reporting_params;
  }
}
