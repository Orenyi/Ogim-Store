import express, { Router } from "express";
import { handlePaystackWebhook } from "../controllers/paystack-webhook.controller.js";

const router = Router();

router.post(
  "/",
  express.raw({
    type: "application/json",
    limit: "100kb",
  }),
  handlePaystackWebhook,
);

export default router;
