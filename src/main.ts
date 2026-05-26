import { CONFIG } from "./config.js";
import { CalendarService } from "./calendar.js";

type ModalComponent = {
  custom_id?: string;
  value?: string;
};

type ModalRow = {
  components?: ModalComponent[];
};

type GasProxyPayload = {
  proxyToken?: string;
  interaction?: {
    type?: number;
    data?: {
      name?: string;
      options?: unknown[];
      components?: ModalRow[];
    };
    member?: { user?: { username?: string } };
    user?: { username?: string };
  };
};

type FollowupMessage = {
  content: string;
  flags?: number;
};

function doGet(): GoogleAppsScript.Content.TextOutput {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: "web app is alive" }))
    .setMimeType(ContentService.MimeType.JSON);
}

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
function getModalValue(payload: GasProxyPayload, customId: string): string {
  const rows = payload.interaction?.data?.components ?? [];

  for (const row of rows as any[]) {
    const component = row.components?.find((item:any) => item.custom_id === customId);
    if (component?.value) return component.value;
  }

  throw new Error(`Missing modal value: ${customId}`);
}

function handleSlashCommand(payload: GasProxyPayload): FollowupMessage {
  const command = payload.interaction?.data?.name;
  if (payload.interaction?.type === 5) {
    const calendarService = new CalendarService();
    const message = calendarService.createEventFromModal({
      title: getModalValue(payload, "title"),
      date: getModalValue(payload, "date"),
      startTime: getModalValue(payload, "startTime"),
      durationMinutes: Number(getModalValue(payload, "durationMinutes")),
    });

    return { content: message };
  }

  if (!command) {
    return { content: "No slash command name found.", flags: 64 };
  }

  if (command === "ping") {
    return { content: "pong from GAS" };
  }

  if (command === "whoami") {
    return { content: `You are ${getInvokerName(payload)}` };
  }

  if (command === "schedule") {
    const calendarService = new CalendarService();
    const message = calendarService.listUpcomingText();

    return { content: message };
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

    const interactionType = payload.interaction?.type;

    if (!payload.interaction || interactionType === undefined || ![2, 5].includes(interactionType)) {
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



}

function message(): GoogleAppsScript.URL_Fetch.HTTPResponse {
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ content: "test" }),
  };

  return UrlFetchApp.fetch(CONFIG.DISCORD_WEBHOOK_URL, options);
}

export function authorizeCalendar(): void {
  CalendarApp.getCalendarById(CONFIG.CALENDAR_ID)?.getEventsForDay(new Date());
}

const gasGlobal = globalThis as typeof globalThis & {
  message: typeof message;
  doPost: typeof doPost;
  authorizeCalendar: typeof authorizeCalendar;
};

gasGlobal.message = message;
gasGlobal.doPost = doPost;
gasGlobal.authorizeCalendar = authorizeCalendar;