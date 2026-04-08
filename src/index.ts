import http from "http";
import { createApp } from "./Main/Libs/Express/app";
import { createSocketIO, getIO } from "./Main/Libs/SocketIO/server";
import {
  setupWhatsAppHandlers,
  reconnectSessions,
  setBotEngine,
} from "./Main/Dependencies/WhatsApp/composition";
import { env } from "./Shared/Env";

const app = createApp();
const server = http.createServer(app);
const port = Number(env.PORT);

// Initialize Socket.IO
createSocketIO(server);

// Setup WhatsApp message handlers with Socket.IO
setupWhatsAppHandlers(getIO);

// Setup Bot Engine
let botEngineInstance: any = null;
try {
  const { botEngine } = require("./Main/Dependencies/BotFlow/composition");
  botEngineInstance = botEngine;
  setBotEngine(botEngine);
  console.log("[Bot] Engine initialized");
} catch (err) {
  console.log("[Bot] Engine not available yet (run db:migrate first)");
}

server.listen(port, async () => {
  console.log(`Server running on port ${port} in ${env.NODE_ENV} mode`);

  // Reconnect any previously connected WhatsApp sessions
  try {
    await reconnectSessions();
  } catch (err) {
    console.error("[WhatsApp] Error reconnecting sessions:", err);
  }

  // Start bot delay resume timer (every 30 seconds)
  if (botEngineInstance) {
    setInterval(async () => {
      try {
        await botEngineInstance.resumeDelayedSessions();
      } catch (err) {
        console.error("[Bot] Error resuming delayed sessions:", err);
      }
    }, 30_000);
    console.log("[Bot] Delay resume timer started (30s interval)");
  }
});
