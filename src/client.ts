import { SessionsClient } from "@google-cloud/dialogflow-cx";

const API_ENDPOINT =
  process.env.LOCATION === "global"
    ? "dialogflow.googleapis.com"
    : `${process.env.LOCATION}-dialogflow.googleapis.com`;

export const client = new SessionsClient({ apiEndpoint: API_ENDPOINT });
