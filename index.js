const express = require("express");
const { serve } = require("inngest/express");
const inngest = require("./inngest/client");
const { createReport, getReport } = require("./store");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/reports", async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "topic is required" });
  }

  const report = createReport(topic);

  await inngest.send({
    name: "report/requested",
    data: { id: report.id, topic },
  });

  res.status(202).json({ id: report.id, status: "pending" });
});

app.get("/reports/:id", (req, res) => {
  const report = getReport(req.params.id);
  if (!report) return res.status(404).json({ error: "Not found" });
  res.json(report);
});
const {sayHello, makeReport, heartbeat } = require("./inngest/functions");
app.use("/api/inngest", serve({ client: inngest, functions: [sayHello, makeReport, heartbeat] }));

app.listen(3000, () => console.log("Server running on port 3000"));