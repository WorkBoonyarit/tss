const { dbStaffArea, dbArea } = require("./data");
// const { dbStaffArea, dbArea } = require("./dataFull");

module.exports = () => {
  const staffCounting = dbArea
    .map((area) => {
      const countStaff = dbStaffArea.filter(
        (staffArea) => staffArea.areaId === area.id
      ).length;
      return { areaId: area.id, areaName: area.areaName, count: countStaff };
    })
    .sort((a, b) => a.count - b.count);

  console.table(staffCounting, ["areaName", "count"]);
};
