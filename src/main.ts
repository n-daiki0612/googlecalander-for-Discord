import { CONFIG } from "./config.js";

type GasProxyPayload = {
  proxyToken?: string;
  interaction?: {
    type?: number;
    data?: { name?: string; options?: unknown[] };
    member?: { user?: { username?: string } };
    user?: { username?: string };
  };
};

type FollowupMessage = {
  content: string;
  flags?: number;
};

function jsonResponse(data: FollowupMessage): GoogleAppsScript.Content.TextOutput {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getInvokerName(payload: GasProxyPayload): string {
  return (
    payload.interaction?.member?.user?.username ??
    payload.interaction?.user?.username ??
    "unknown-user"
  );
}

function handleSlashCommand(payload: GasProxyPayload): FollowupMessage {
  const command = payload.interaction?.data?.name;

  if (!command) {
    return { content: "No slash command name found.", flags: 64 };
  }

  if (command === "ping") {
    return { content: "pong from GAS" };
  }

  if (command === "whoami") {
    return { content: `You are ${getInvokerName(payload)}` };
  }

  return {
    content: `Unknown command: /${command}`,
    flags: 64,
  };
}

function doPost(
  e: GoogleAppsScript.Events.DoPost
): GoogleAppsScript.Content.TextOutput {
  try {
    const raw = e.postData?.contents ?? "{}";
    const payload = JSON.parse(raw) as GasProxyPayload;

    if (payload.proxyToken !== CONFIG.PROXY_TOKEN) {
      return jsonResponse({
        content: "Unauthorized proxy request.",
        flags: 64,
      });
    }

    if (!payload.interaction || payload.interaction.type !== 2) {
      return jsonResponse({
        content: "Unsupported interaction type.",
        flags: 64,
      });
    }

    return jsonResponse(handleSlashCommand(payload));
  } catch (error) {
    return jsonResponse({
      content: `GAS error: ${String(error)}`,
      flags: 64,
    });
  }

    const command = payload.interaction?.data?.name;

    if (command === "ping") {
      return jsonResponse({ content: "pong from GAS" });
    }

    if 
}

function message(): GoogleAppsScript.URL_Fetch.HTTPResponse {
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ content: "test" }),
  };

  return UrlFetchApp.fetch(CONFIG.DISCORD_WEBHOOK_URL, options);
}

const gasGlobal = globalThis as typeof globalThis & {
  message: typeof message;
  doPost: typeof doPost;
};

gasGlobal.message = message;
gasGlobal.doPost = doPost;
