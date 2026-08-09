interface Env {
  KV: KVNamespace;
  TELEGRAM_BOT_TOKEN: string;
  QUBIC_RPC_URL: string;
  QUBIC_QUERY_RPC_URL: string;
  CMC_API_KEY?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; first_name: string; username?: string };
    chat: { id: number; type: string };
    text?: string;
    date: number;
  };
}

interface WalletData {
  address: string;
  label: string;
  addedAt: number;
}

interface BalanceSnapshot {
  balance: number;
  incomingAmount: number;
  outgoingAmount: number;
}

interface AssetEvent {
  epoch: number;
  tickNumber: number;
  timestamp: string;
  transactionHash: string;
  logType: number;
  logId: string;
  quTransfer?: {
    source: string;
    destination: string;
    amount: string;
  };
  assetPossessionChange?: {
    source: string;
    destination: string;
    assetIssuer: string;
    assetName: string;
    numberOfShares: string;
  };
}

const TELEGRAM_API = (token: string) => `https://api.telegram.org/bot${token}`;

async function sendMessage(env: Env, chatId: number, text: string): Promise<void> {
  await fetch(`${TELEGRAM_API(env.TELEGRAM_BOT_TOKEN)}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

async function getBalance(address: string, rpcUrl: string): Promise<{ balance: number; incoming: number; outgoing: number }> {
  const res = await fetch(`${rpcUrl}/v1/balances/${address}`);
  if (!res.ok) throw new Error(`RPC error: ${res.status}`);
  const data: any = await res.json();
  const b = data.balance;
  return {
    balance: Number(b.balance),
    incoming: Number(b.incomingAmount),
    outgoing: Number(b.outgoingAmount),
  };
}

async function getCurrentTick(rpcUrl: string): Promise<number> {
  const res = await fetch(`${rpcUrl}/v1/status`);
  if (!res.ok) throw new Error(`RPC error: ${res.status}`);
  const data: any = await res.json();
  return data.lastProcessedTick.tickNumber;
}

async function getEventLogs(
  queryUrl: string,
  filters: Record<string, string>,
  limit: number = 100
): Promise<AssetEvent[]> {
  const res = await fetch(`${queryUrl}/getEventLogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filters,
      pagination: { offset: 0, size: limit },
    }),
  });
  if (!res.ok) throw new Error(`Query RPC error: ${res.status}`);
  const data: any = await res.json();
  return data.eventLogs ?? [];
}

async function getPrice(env: Env): Promise<{ usd: number; change24h: number; change7d: number } | null> {
  if (env.CMC_API_KEY) {
    try {
      const res = await fetch(
        "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=QUBIC&convert=USD",
        { headers: { "X-CMC_PRO_API_KEY": env.CMC_API_KEY } }
      );
      if (res.ok) {
        const data: any = await res.json();
        const quote = data?.data?.QUBIC?.quote?.USD;
        if (quote?.price > 0) {
          return {
            usd: quote.price,
            change24h: quote.percent_change_24h || 0,
            change7d: quote.percent_change_7d || 0,
          };
        }
      }
    } catch (e) {
      console.error("CoinMarketCap failed:", e);
    }
  }

  try {
    const res = await fetch("https://api.coinpaprika.com/v1/tickers/qu-qubic/?quotes=USD");
    if (res.ok) {
      const data: any = await res.json();
      const quote = data?.quotes?.USD;
      if (quote?.price > 0) {
        return {
          usd: quote.price,
          change24h: quote.percent_change_24h || 0,
          change7d: quote.percent_change_7d || 0,
        };
      }
    }
  } catch (e) {
    console.error("CoinPaprika failed:", e);
  }

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=qubic-network&vs_currencies=usd&include_24hr_change=true"
    );
    if (res.ok) {
      const data: any = await res.json();
      const q = data?.["qubic-network"];
      if (q?.usd > 0) {
        return {
          usd: q.usd,
          change24h: q.usd_24h_change || 0,
          change7d: 0,
        };
      }
    }
  } catch (e) {
    console.error("CoinGecko failed:", e);
  }

  return null;
}

async function getWallets(kv: KVNamespace, chatId: number): Promise<WalletData[]> {
  const data = await kv.get(`wallets:${chatId}`);
  return data ? JSON.parse(data) : [];
}

async function saveWallets(kv: KVNamespace, chatId: number, wallets: WalletData[]): Promise<void> {
  await kv.put(`wallets:${chatId}`, JSON.stringify(wallets));
}

async function getBalanceSnapshot(kv: KVNamespace, address: string): Promise<BalanceSnapshot | null> {
  const data = await kv.get(`balance:${address}`);
  return data ? JSON.parse(data) : null;
}

async function saveBalanceSnapshot(kv: KVNamespace, address: string, snapshot: BalanceSnapshot): Promise<void> {
  await kv.put(`balance:${address}`, JSON.stringify(snapshot));
}

async function getLastProcessedTick(kv: KVNamespace, address: string): Promise<number> {
  const data = await kv.get(`last_tick:${address}`);
  return data ? Number(data) : 0;
}

async function saveLastProcessedTick(kv: KVNamespace, address: string, tick: number): Promise<void> {
  await kv.put(`last_tick:${address}`, String(tick));
}

async function getAllChatIds(kv: KVNamespace): Promise<number[]> {
  const data = await kv.get("all_chat_ids");
  return data ? JSON.parse(data) : [];
}

async function addChatId(kv: KVNamespace, chatId: number): Promise<void> {
  const ids = await getAllChatIds(kv);
  if (!ids.includes(chatId)) {
    ids.push(chatId);
    await kv.put("all_chat_ids", JSON.stringify(ids));
  }
}

function formatAmount(amount: string | number): string {
  return Number(amount).toLocaleString();
}

function shortenAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
}

async function handleStart(env: Env, chatId: number, firstName: string): Promise<void> {
  await addChatId(env.KV, chatId);
  await sendMessage(env, chatId,
    `👋 Welcome to QubicPulse Bot, ${firstName}!\n\n` +
    `Your Qubic Command Center - right in Telegram.\n\n` +
    `📋 <b>Commands:</b>\n` +
    `/wallet add &lt;address&gt; - Add a wallet\n` +
    `/wallet list - List your wallets\n` +
    `/wallet remove &lt;address&gt; - Remove a wallet\n` +
    `/price - Check QUBIC price\n` +
    `/help - Show this message\n\n` +
    `Start by adding a wallet: /wallet add YOUR_ADDRESS`
  );
}

async function handleHelp(env: Env, chatId: number): Promise<void> {
  await sendMessage(env, chatId,
    `📋 <b>QubicPulse Bot Commands</b>\n\n` +
    `/start - Welcome message\n` +
    `/wallet add &lt;address&gt; - Add a wallet to track\n` +
    `/wallet list - List all your wallets\n` +
    `/wallet remove &lt;address&gt; - Remove a wallet\n` +
    `/price - Check current QUBIC price\n` +
    `/help - Show this message\n\n` +
    `🔔 You'll automatically receive notifications for:\n` +
    `• Incoming/outgoing QUBIC transactions\n` +
    `• ALL token transfers (any token on Qubic chain)\n\n` +
    `📊 Plus a daily summary (07:00 UTC) and a weekly summary (Monday 07:00 UTC).`
  );
}

async function handleWalletAdd(env: Env, chatId: number, address: string): Promise<void> {
  address = address.trim().toUpperCase();
  
  if (address.length !== 60 || !/^[A-Z]+$/.test(address)) {
    await sendMessage(env, chatId, "❌ Invalid Qubic address. Must be 60 uppercase characters.");
    return;
  }

  const wallets = await getWallets(env.KV, chatId);
  
  if (wallets.some(w => w.address === address)) {
    await sendMessage(env, chatId, "⚠️ This wallet is already added.");
    return;
  }

  try {
    const [balance, currentTick] = await Promise.all([
      getBalance(address, env.QUBIC_RPC_URL),
      getCurrentTick(env.QUBIC_RPC_URL),
    ]);
    
    const wallet: WalletData = {
      address,
      label: `Wallet ${wallets.length + 1}`,
      addedAt: Date.now(),
    };
    wallets.push(wallet);
    await saveWallets(env.KV, chatId, wallets);
    await addChatId(env.KV, chatId);

    await saveBalanceSnapshot(env.KV, address, {
      balance: balance.balance,
      incomingAmount: balance.incoming,
      outgoingAmount: balance.outgoing,
    });

    await saveLastProcessedTick(env.KV, address, currentTick);

    await sendMessage(env, chatId,
      `✅ <b>Wallet added!</b>\n\n` +
      `Address: ${shortenAddress(address)}\n` +
      `Balance: ${formatAmount(balance.balance)} QUBIC\n` +
      `Incoming: +${formatAmount(balance.incoming)} QUBIC\n` +
      `Outgoing: -${formatAmount(balance.outgoing)} QUBIC\n\n` +
      `You'll receive notifications for ALL transactions on this wallet.`
    );
  } catch (e) {
    await sendMessage(env, chatId, `❌ Failed to add wallet: ${e instanceof Error ? e.message : "Unknown error"}`);
  }
}

async function handleWalletList(env: Env, chatId: number): Promise<void> {
  const wallets = await getWallets(env.KV, chatId);

  if (wallets.length === 0) {
    await sendMessage(env, chatId, "📋 No wallets added yet.\n\nUse /wallet add <address> to add one.");
    return;
  }

  let message = `📋 <b>Your Wallets (${wallets.length})</b>\n\n`;

  for (let i = 0; i < wallets.length; i++) {
    const w = wallets[i];
    try {
      const balance = await getBalance(w.address, env.QUBIC_RPC_URL);
      message += `${i + 1}. ${w.label}\n`;
      message += `   ${shortenAddress(w.address)}\n`;
      message += `   Balance: ${formatAmount(balance.balance)} QUBIC\n\n`;
    } catch {
      message += `${i + 1}. ${w.label}\n`;
      message += `   ${shortenAddress(w.address)}\n`;
      message += `   Balance: Error fetching\n\n`;
    }
  }

  await sendMessage(env, chatId, message);
}

async function handleWalletRemove(env: Env, chatId: number, address: string): Promise<void> {
  address = address.trim().toUpperCase();
  const wallets = await getWallets(env.KV, chatId);
  const index = wallets.findIndex(w => w.address === address);

  if (index === -1) {
    await sendMessage(env, chatId, "❌ Wallet not found.");
    return;
  }

  wallets.splice(index, 1);
  await saveWallets(env.KV, chatId, wallets);
  await sendMessage(env, chatId, `✅ Wallet removed!\n\n${shortenAddress(address)}`);
}

async function handlePrice(env: Env, chatId: number): Promise<void> {
  const price = await getPrice(env);
  
  if (!price) {
    await sendMessage(env, chatId, "❌ Failed to fetch QUBIC price. Please try again later.");
    return;
  }

  const emoji = price.change24h >= 0 ? "📈" : "📉";
  const sign = price.change24h >= 0 ? "+" : "";
  
  await sendMessage(env, chatId,
    `${emoji} <b>QUBIC Price</b>\n\n` +
    `💰 Price: $${price.usd.toFixed(10)}\n` +
    `📊 24h Change: ${sign}${price.change24h.toFixed(2)}%`
  );
}

async function handleSetWebhook(env: Env, request: Request): Promise<Response> {
  const url = new URL(request.url);
  const webhookUrl = `${url.origin}/webhook`;
  
  const res = await fetch(`${TELEGRAM_API(env.TELEGRAM_BOT_TOKEN)}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}

async function handleWebhook(env: Env, request: Request): Promise<Response> {
  const update: TelegramUpdate = await request.json();

  if (!update.message?.text) {
    return new Response("OK");
  }

  const { chat, text, from } = update.message;
  const chatId = chat.id;
  const parts = text.trim().split(/\s+/);
  const command = parts[0].toLowerCase().replace(/@qubic_pulse_bot$/, "");

  switch (command) {
    case "/start":
      await handleStart(env, chatId, from.first_name);
      break;
    case "/help":
      await handleHelp(env, chatId);
      break;
    case "/wallet":
      if (parts.length < 2) {
        await sendMessage(env, chatId, "Usage: /wallet add|list|remove <address>");
        break;
      }
      const subCommand = parts[1].toLowerCase();
      if (subCommand === "add" && parts.length >= 3) {
        await handleWalletAdd(env, chatId, parts[2]);
      } else if (subCommand === "list") {
        await handleWalletList(env, chatId);
      } else if (subCommand === "remove" && parts.length >= 3) {
        await handleWalletRemove(env, chatId, parts[2]);
      } else {
        await sendMessage(env, chatId, "Usage: /wallet add|list|remove <address>");
      }
      break;
    case "/price":
      await handlePrice(env, chatId);
      break;
    default:
      await sendMessage(env, chatId, "Unknown command. Use /help to see available commands.");
  }

  return new Response("OK");
}

async function handleScheduled(env: Env): Promise<void> {
  const chatIds = await getAllChatIds(env.KV);
  if (chatIds.length === 0) return;

  let currentTick = 0;
  try {
    currentTick = await getCurrentTick(env.QUBIC_RPC_URL);
  } catch (e) {
    console.error("Failed to get current tick:", e);
    return;
  }

  for (const chatId of chatIds) {
    const wallets = await getWallets(env.KV, chatId);
    
    for (const wallet of wallets) {
      try {
        // 1. Check QUBIC balance changes
        const currentBalance = await getBalance(wallet.address, env.QUBIC_RPC_URL);
        const previousSnapshot = await getBalanceSnapshot(env.KV, wallet.address);

        if (previousSnapshot) {
          const incomingDiff = currentBalance.incoming - previousSnapshot.incomingAmount;
          const outgoingDiff = currentBalance.outgoing - previousSnapshot.outgoingAmount;

          if (incomingDiff > 0) {
            await sendMessage(env, chatId,
              `📥 <b>Incoming QUBIC</b>\n\n` +
              `+${formatAmount(incomingDiff)} QUBIC\n` +
              `Wallet: ${wallet.label} (${shortenAddress(wallet.address)})`
            );
          }

          if (outgoingDiff > 0) {
            await sendMessage(env, chatId,
              `📤 <b>Outgoing QUBIC</b>\n\n` +
              `-${formatAmount(outgoingDiff)} QUBIC\n` +
              `Wallet: ${wallet.label} (${shortenAddress(wallet.address)})`
            );
          }
        }

        // Always save snapshot to prevent duplicate notifications
        await saveBalanceSnapshot(env.KV, wallet.address, {
          balance: currentBalance.balance,
          incomingAmount: currentBalance.incoming,
          outgoingAmount: currentBalance.outgoing,
        });

        // 2. Check ALL asset changes (tokens)
        const lastTick = await getLastProcessedTick(env.KV, wallet.address);
        
        if (currentTick > lastTick) {
          // Check incoming asset transfers
          try {
            const incomingEvents = await getEventLogs(
              env.QUBIC_QUERY_RPC_URL,
              { destination: wallet.address, logType: "3" },
              100
            );

            for (const event of incomingEvents) {
              if (!event.assetPossessionChange) continue;
              if (event.tickNumber <= lastTick) continue;

              const { assetName, numberOfShares, source } = event.assetPossessionChange;
              if (!assetName || assetName.trim() === "") continue;
              const shares = Number(numberOfShares);
              if (isNaN(shares) || shares <= 0) continue;

              await sendMessage(env, chatId,
                `📥 <b>Incoming Token</b>\n\n` +
                `+${formatAmount(shares)} ${assetName}\n` +
                `From: ${shortenAddress(source)}\n` +
                `Wallet: ${wallet.label} (${shortenAddress(wallet.address)})`
              );
            }
          } catch (e) {
            console.error(`Error checking incoming assets for ${wallet.address}:`, e);
          }

          // Check outgoing asset transfers
          try {
            const outgoingEvents = await getEventLogs(
              env.QUBIC_QUERY_RPC_URL,
              { source: wallet.address, logType: "3" },
              100
            );

            for (const event of outgoingEvents) {
              if (!event.assetPossessionChange) continue;
              if (event.tickNumber <= lastTick) continue;

              const { assetName, numberOfShares, destination } = event.assetPossessionChange;
              if (!assetName || assetName.trim() === "") continue;
              const shares = Number(numberOfShares);
              if (isNaN(shares) || shares <= 0) continue;

              await sendMessage(env, chatId,
                `📤 <b>Outgoing Token</b>\n\n` +
                `-${formatAmount(shares)} ${assetName}\n` +
                `To: ${shortenAddress(destination)}\n` +
                `Wallet: ${wallet.label} (${shortenAddress(wallet.address)})`
              );
            }
          } catch (e) {
            console.error(`Error checking outgoing assets for ${wallet.address}:`, e);
          }
        }

        // Always update last processed tick
        await saveLastProcessedTick(env.KV, wallet.address, currentTick);

      } catch (e) {
        console.error(`Error checking wallet ${wallet.address}:`, e);
      }
    }
  }
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getUtcWeekStart(now: Date): Date {
  const start = new Date(now);
  const offset = (now.getUTCDay() + 6) % 7;
  start.setUTCDate(now.getUTCDate() - offset);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

async function sendSummary(env: Env, type: "daily" | "weekly"): Promise<void> {
  const chatIds = await getAllChatIds(env.KV);
  if (chatIds.length === 0) return;

  const price = await getPrice(env);
  const now = new Date();

  for (const chatId of chatIds) {
    const wallets = await getWallets(env.KV, chatId);
    if (wallets.length === 0) continue;

    let total = 0;
    const lines: string[] = [];
    for (const w of wallets) {
      try {
        const b = await getBalance(w.address, env.QUBIC_RPC_URL);
        total += b.balance;
        lines.push(`   ${w.label}: ${formatAmount(b.balance)} QUBIC`);
      } catch {
        lines.push(`   ${w.label}: <i>unavailable</i>`);
      }
    }

    let msg: string;
    if (type === "daily") {
      msg = `📊 <b>QubicPulse Daily Summary</b>\n📅 ${WEEKDAYS[now.getUTCDay()]}, ${now.toUTCString().slice(0, 16)} UTC\n\n`;
    } else {
      const start = getUtcWeekStart(now);
      msg = `📊 <b>QubicPulse Weekly Summary</b>\n🗓 ${start.toUTCString().slice(0, 16)} - ${now.toUTCString().slice(0, 16)} UTC\n\n`;
    }

    if (price) {
      msg += `💰 <b>QUBIC Price:</b> $${price.usd.toFixed(10)}\n`;
      if (type === "daily") {
        const sign = price.change24h >= 0 ? "+" : "";
        msg += `📈 <b>24h Change:</b> ${sign}${price.change24h.toFixed(2)}%\n`;
      } else {
        const sign = price.change7d >= 0 ? "+" : "";
        msg += `📈 <b>7d Change:</b> ${sign}${price.change7d.toFixed(2)}%\n`;
      }
    } else {
      msg += `💰 <b>QUBIC Price:</b> <i>unavailable</i>\n`;
    }

    msg += `\n👛 <b>Wallets:</b> ${wallets.length}\n`;
    msg += `💎 <b>Total Balance:</b> ${formatAmount(total)} QUBIC\n\n`;
    msg += lines.join("\n");

    try {
      await sendMessage(env, chatId, msg);
    } catch (e) {
      console.error(`Failed to send ${type} summary to ${chatId}:`, e);
    }
  }
}

async function sendDailySummary(env: Env): Promise<void> {
  if (new Date().getUTCDay() === 1) return;
  const today = new Date().toISOString().slice(0, 10);
  if ((await env.KV.get("summary_last_daily")) === today) return;
  await env.KV.put("summary_last_daily", today);
  await sendSummary(env, "daily");
}

async function sendWeeklySummary(env: Env): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  if ((await env.KV.get("summary_last_weekly")) === today) return;
  await env.KV.put("summary_last_weekly", today);
  await sendSummary(env, "weekly");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/webhook" && request.method === "POST") {
      return handleWebhook(env, request);
    }

    if (url.pathname === "/set-webhook") {
      return handleSetWebhook(env, request);
    }

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok", bot: "qubic_pulse_bot" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("QubicPulse Telegram Bot", { status: 200 });
  },

  async scheduled(controller: ScheduledEvent, env: Env): Promise<void> {
    if (controller.cron === "0 7 * * 1") {
      await sendWeeklySummary(env);
      return;
    }
    if (controller.cron === "0 7 * * *") {
      await sendDailySummary(env);
      return;
    }
    await handleScheduled(env);
  },
};
