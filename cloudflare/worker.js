export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return json({ error: "Method Not Allowed" }, 405);
    }

    const signature = request.headers.get("x-signature-ed25519");
    const timestamp = request.headers.get("x-signature-timestamp");
    const rawBody = await request.text();

    if (!signature || !timestamp) {
      return json({ error: "Missing signature headers" }, 401);
    }

    if (!isFreshTimestamp(timestamp)) {
      return json({ error: "Stale timestamp" }, 401);
    }

    const validSignature = await verifyDiscordSignature({
      publicKeyHex: env.DISCORD_PUBLIC_KEY,
      signatureHex: signature,
      timestamp,
      rawBody,
    });

    if (!validSignature) {
      return json({ error: "Invalid request signature" }, 401);
    }

    let interaction;
    try {
      interaction = JSON.parse(rawBody);
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    if (interaction.type === 1) {
      return json({ type: 1 }, 200);
    }

    ctx.waitUntil(
      processInteractionInBackground({
        env,
        interaction,
      })
    );

    return json(
      {
        type: 5,
        data: { flags: 64 },
      },
      200
    );
  },
};

async function processInteractionInBackground({ env, interaction }) {
  const followupUrl = `https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}`;

  try {
    const gasResponse = await fetch(env.GAS_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        proxyToken: env.PROXY_TOKEN,
        interaction,
      }),
    });

    if (!gasResponse.ok) {
      await postFollowup(followupUrl, "GAS request failed.", true);
      return;
    }

    const result = await gasResponse.json();
    const content = typeof result?.content === "string" ? result.content : "Done.";
    const ephemeral = Number(result?.flags) === 64;

    await postFollowup(followupUrl, content, ephemeral);
  } catch (error) {
    await postFollowup(followupUrl, `Worker error: ${String(error)}`, true);
  }
}

async function postFollowup(url, content, ephemeral) {
  await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      content,
      flags: ephemeral ? 64 : undefined,
    }),
  });
}

function isFreshTimestamp(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) {
    return false;
  }
  return Math.abs(now - ts) <= 300;
}

async function verifyDiscordSignature({ publicKeyHex, signatureHex, timestamp, rawBody }) {
  if (!publicKeyHex) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    hexToBytes(publicKeyHex),
    { name: "Ed25519" },
    false,
    ["verify"]
  );

  const body = new TextEncoder().encode(timestamp + rawBody);

  return crypto.subtle.verify(
    { name: "Ed25519" },
    key,
    hexToBytes(signatureHex),
    body
  );
}

function hexToBytes(hex) {
  if (!hex || hex.length % 2 !== 0) {
    throw new Error("Invalid hex");
  }

  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
    },
  });
}
