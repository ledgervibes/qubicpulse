import { TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME } from "../utils/constants";

const API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function fetchTG<T>(method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Telegram API error: ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || "Telegram API failed");
  return data.result;
}

export async function sendMessage(
  chatId: string,
  text: string,
  parseMode?: "HTML" | "Markdown"
): Promise<void> {
  await fetchTG("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
  });
}

export async function getUpdates(): Promise<
  Array<{ message?: { chat: { id: number }; text?: string; from?: { id: number } } }>
> {
  return fetchTG("getUpdates");
}

export function getBotLink(walletAddress?: string): string {
  const startParam = walletAddress ? `?start=${walletAddress}` : "";
  return `https://t.me/${TELEGRAM_BOT_USERNAME}${startParam}`;
}

export async function sendPriceAlert(
  chatId: string,
  condition: "above" | "below",
  targetPrice: number,
  currentPrice: number
): Promise<void> {
  const emoji = condition === "above" ? "🚀" : "📉";
  const text = `${emoji} <b>Price Alert!</b>\n\nQUBIC is now <b>${condition}</b> $${targetPrice.toFixed(10)}\nCurrent price: $${currentPrice.toFixed(10)}`;
  await sendMessage(chatId, text, "HTML");
}

export async function sendWalletNotification(
  chatId: string,
  type: "incoming" | "outgoing",
  amount: number,
  address: string
): Promise<void> {
  const emoji = type === "incoming" ? "📥" : "📤";
  const direction = type === "incoming" ? "Received" : "Sent";
  const text = `${emoji} <b>Wallet Transaction</b>\n\n${direction}: ${amount.toLocaleString()} QUBIC\nAddress: ${address.slice(0, 8)}...${address.slice(-8)}`;
  await sendMessage(chatId, text, "HTML");
}

export async function sendDailySummary(
  chatId: string,
  price: number,
  change24h: number,
  totalBalance: number
): Promise<void> {
  const emoji = change24h >= 0 ? "📈" : "📉";
  const text = `${emoji} <b>QubicPulse Daily Summary</b>\n\n` +
    `💰 QUBIC Price: $${price.toFixed(10)}\n` +
    `📊 24h Change: ${change24h >= 0 ? "+" : ""}${change24h.toFixed(2)}%\n` +
    `👛 Total Balance: ${totalBalance.toLocaleString()} QUBIC\n\n` +
    `Have a great day! 🚀`;
  await sendMessage(chatId, text, "HTML");
}

export async function sendBatchNotification(
  chatId: string,
  alerts: Array<{ type: string; message: string }>
): Promise<void> {
  if (alerts.length === 0) return;

  let text = "🔔 <b>QubicPulse Alerts</b>\n\n";
  alerts.forEach((alert, i) => {
    text += `${i + 1}. ${alert.message}\n`;
  });

  await sendMessage(chatId, text, "HTML");
}
