
const reports = {};
let nextId = 1;

function createReport(topic) {
  const id = String(nextId++);
  reports[id] = { id, topic, status: "pending" };
  return reports[id];
}

function getReport(id) {
  return reports[id];
}

module.exports = { createReport, getReport, reports };