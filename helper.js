const { dbArea, dbStaff } = require("./data");

module.exports = (results) => {
  const getAreaName = (areaId) => {
    return dbArea.find((area) => area.id === areaId).areaName;
  };
  const getStaffName = (staffId) => {
    return dbStaff.find((staff) => staff.id === staffId).staffName;
  };
  return results.map((r) => {
    const staffWork = r.staffWork.map((w) => ({
      areaName: getAreaName(w.areaId),
      staffName: getStaffName(w.staffId),
      staffId: w.staffId,
    }));
    const staffStop = r.staffStop.map((w) => getStaffName(w));
    return {
      date: r.date,
      staffWork,
      staffStop,
    };
  });
};
