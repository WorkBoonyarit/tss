const isDev = require("./isDev");
const { dbArea, dbStaff } = isDev ? require("./data") : require("./dataFull");

const getAreaName = (areaId) => {
  return dbArea.find((area) => area.id === areaId).areaName;
};
const getAreaTime = (areaOpen) => {
  return dbArea.find((area) => area.id === areaOpen)?.areaTime;
};
const getStaffName = (staffId) => {
  return dbStaff.find((staff) => staff.id === staffId).staffName;
};
const getVidStaff = (staffId) => {
  return dbStaff.find((staff) => staff.id === staffId).vid;
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
  getVidStaff,
  getAreaName,
  mapStaffWork,
  mapStaffStop,
  getAreaTime,
};
