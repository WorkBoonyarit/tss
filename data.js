const moment = require("moment");

// ### steps (0) ###
const dbStaff = [
  { id: "1", vid: "1304" },
  { id: "2", vid: "5129" },
  { id: "3", vid: "5215" },
  { id: "4", vid: "5533" },
  { id: "5", vid: "5569" },
  { id: "6", vid: "5640" },
  { id: "7", vid: "5661" },
  { id: "8", vid: "5666" },
];
// ### steps (0) ###
const dbArea = [
  { id: "1", areaName: "ดินแดง", areaTime: ["09:00", "19:00"] },
  { id: "2", areaName: "ดินแดง (บ่าย)", areaTime: ["09:00", "19:00"] },
  { id: "3", areaName: "นางเลิ้ง", areaTime: ["09:00", "19:00"] },
  { id: "4", areaName: "ลุมพินี", areaTime: ["09:00", "19:00"] },
  { id: "5", areaName: "ทองหล่อ", areaTime: ["09:00", "19:00"] },
  { id: "6", areaName: "สาธุประดิษฐ์", areaTime: ["09:00", "19:00"] },
  { id: "7", areaName: "ท่าพระ", areaTime: ["09:00", "19:00"] },
];
// ### steps (0) ###
const dbStaffArea = [
  {
    period: "2024-11",
    staffArea: [
      { staffId: "1", areaWork: ["1", "2", "3"] },
      { staffId: "2", areaWork: ["2", "5", "6"] },
      { staffId: "3", areaWork: ["3", "4", "5"] },
      { staffId: "4", areaWork: ["4", "5", "6"] },
      { staffId: "5", areaWork: ["5", "6", "7"] },
      { staffId: "6", areaWork: ["6", "7", "1"] },
      { staffId: "7", areaWork: ["7", "1", "2"] },
      { staffId: "8", areaWork: ["1", "2", "3"] },
    ],
  },
];
// ### steps (0) ###
const dbStaffLeave = [
  {
    date: "2024-11-03",
    staffId: "4",
    leaveTime: ["19:00", "20:00"],
    leaveType: "MEETING",
  },
  // {
  //   date: "2024-11-03",
  //   staffId: "3",
  //   leaveTime: ["09:00", "12:00"],
  //   leaveType: "MEETING",
  // },
  {
    date: "2024-11-03",
    staffId: "7",
    leaveTime: ["09:00", "19:00"],
    leaveType: "ANNUAL LEAVE",
  },
  {
    date: "2024-11-04",
    staffId: "2",
    leaveTime: ["09:00", "19:00"],
    leaveType: "ANNUAL LEAVE",
  },
];

// ### steps (1) ###
const exCludeArea = [["2", "4"], [], ["1", "3"], [], ["3"], ["5"], ["2", "7"]];

// ### steps (1) ###
const dbAreaOpens = Array(exCludeArea.length)
  .fill("")
  .map((_, idx) => {
    return {
      id: `${idx + 1}`,
      date: moment().startOf("months").add(idx, "days").format("YYYY-MM-DD"),
      areaIds: dbArea
        .map((area) => area.id)
        .filter((areaIds) => !exCludeArea[idx].includes(areaIds)),
    };
  });

module.exports = {
  exCludeArea,
  dbAreaOpens,
  dbStaffArea,
  dbStaffLeave,
  dbArea,
};
