const { dbArea, dbStaff } = require("./data");

const getAreaName = (areaId) => {
  return dbArea.find((area) => area.id === areaId).areaName;
};
const getStaffName = (staffId) => {
  return dbStaff.find((staff) => staff.id === staffId).staffName;
};

const mapStaffWork = (r) => {
  return r.map((w) => ({
    areaName: getAreaName(w.areaId),
    staffName: getStaffName(w.staffId),
    staffId: w.staffId,
  }));
};

const mapStaffStop = (r) => {
  return r.map((w) => {
    return {
      staffName: getStaffName(w),
      staffId: w,
    };
  });
};

module.exports = {
  getStaffName,
  getAreaName,
  mapStaffWork,
  mapStaffStop,
};
