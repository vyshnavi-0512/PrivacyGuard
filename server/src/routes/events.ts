import { Router } from "express";

const router = Router();

router.post("/events", (req, res) => {
  console.log("Analytics event:", req.body);
  res.json({ success: true });
});

export default router;