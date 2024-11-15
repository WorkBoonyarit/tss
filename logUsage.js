const os = require("os");

module.exports = (label) => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  console.log(`[${label}]`);
  console.log(
    `Memory Usage: RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(
    `CPU Usage: User: ${cpuUsage.user / 1000} ms, System: ${
      cpuUsage.system / 1000
    } ms`
  );
};
