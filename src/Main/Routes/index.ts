import { Router } from "express";
import { authRouter } from "./Auth";
import { pipelinesRouter } from "./Pipelines";
import { leadsRouter } from "./Leads";
import { activitiesRouter } from "./Activities";
import { dashboardRouter } from "./Dashboard";
import { whatsappRouter } from "./WhatsApp";
import { botFlowRouter } from "./BotFlow";
import { settingsRouter } from "./Settings";

export const router = Router();

router.use("/auth", authRouter);
router.use("/pipelines", pipelinesRouter);
router.use("/leads", leadsRouter);
router.use("/activities", activitiesRouter);
router.use("/dashboard", dashboardRouter);
router.use("/whatsapp", whatsappRouter);
router.use("/bot-flows", botFlowRouter);
router.use("/settings", settingsRouter);
