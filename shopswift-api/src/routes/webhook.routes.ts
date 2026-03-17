import express, { Router } from 'express';
import { stripeWebhook } from '../controllers/webhook.controller';

const router = Router();

/**
 * CRITICAL: Stripe signature verification requires the RAW request body.
 * We use express.raw() instead of the standard express.json() here.
 * This route will be available at /api/webhooks/stripe
 */
router.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;