import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { JwtEncrypter } from "../../../Infrastructure/Cryptography/JwtEncrypter";
import { env } from "../../../Shared/Env";

let io: SocketIOServer | null = null;

export function createSocketIO(httpServer: HttpServer): SocketIOServer {
  const encrypter = new JwtEncrypter();

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    try {
      const payload = await encrypter.decrypt(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on("join:conversation", ({ contactId }: { contactId: string }) => {
      socket.join(`conversation:${contactId}`);
    });

    socket.on("leave:conversation", ({ contactId }: { contactId: string }) => {
      socket.leave(`conversation:${contactId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}
