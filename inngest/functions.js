const inngest = require("./client");
const { reports } = require("../store");

const sayHello = inngest.createFunction(
  { id: "say-hello", triggers: [{ event: "test/hello" }] },
  async ({ step }) => {
    await step.sleep("wait-a-bit", "5s");
    return "Hello from the background!";
  }
);

const makeReport = inngest.createFunction(
  { id: "make-report", triggers: [{ event: "report/requested" }], retries: 2 },
  async ({ event, step }) => {
    const { id, topic } = event.data;

    await step.sleep("do-the-slow-work", "8s");

    try {
      const result = await step.run("build-report", async () => {
        if (topic === "fail") {
          throw new Error("The report oven is broken!");
        }
        return `Report on "${topic}" generated at ${new Date().toISOString()}`;
      });

      reports[id].status = "done";
      reports[id].result = result;
      return result;
    } catch (err) {
      reports[id].status = "failed";
      throw err; // re-throw so Inngest still marks the run Failed
    }
  }
);

const heartbeat = inngest.createFunction(
  { id: "heartbeat", triggers: [{ cron: "* * * * *" }] },
  async () => {
    const all = Object.values(reports);
    const pending = all.filter(r => r.status === "pending").length;
    const done = all.filter(r => r.status === "done").length;
    const failed = all.filter(r => r.status === "failed").length;

    console.log(`[heartbeat] pending: ${pending}, done: ${done}, failed: ${failed}`);
  }
);

module.exports = { sayHello, makeReport, heartbeat };