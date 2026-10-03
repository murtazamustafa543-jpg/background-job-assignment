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
  { id: "make-report", triggers: [{ event: "report/requested" }] },
  async ({ event, step }) => {
    const { id, topic } = event.data;

    await step.sleep("do-the-slow-work", "8s");

    const result = await step.run("build-report", async () => {
      return `Report on "${topic}" generated at ${new Date().toISOString()}`;
    });

    reports[id].status = "done";
    reports[id].result = result;

    return result;
  }
);

module.exports = { sayHello, makeReport };