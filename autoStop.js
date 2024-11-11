const { exCludeArea } = require("./data");
const moment = require("moment");

module.exports = () => {
  const nowPeriod = moment().format("YYYY-MM");
  Array(exCludeArea.length)
    .fill("")
    .forEach((_, days) => {
      console.log("DAYS", days + 1);
      console.log("🚀 ~ .forEach ~ nowPeriod:", nowPeriod);
    });
};
