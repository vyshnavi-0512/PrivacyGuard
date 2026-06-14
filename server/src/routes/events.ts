import { Router } from "express";

const router = Router();

router.get("/events", (_req, res) => {
  res.json({
    message: "events route reached"
  });
});

router.post("/events", (req, res) => {
  console.log("Analytics event:", req.body);
  res.json({ success: true });
});

export default router;