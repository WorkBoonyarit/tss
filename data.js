const moment = require("moment");

// ### steps (0) ###
const dbStaff = [
  { id: "1", vid: "1304", staffName: "นายธเนศร์ ยาใจ" },
  { id: "2", vid: "5129", staffName: "นายธวัชชัย ขวัญเจริญ" },
  { id: "3", vid: "5215", staffName: "นายนัฐพล ชื่นอารมย์" },
  { id: "4", vid: "5533", staffName: "นายสมยศ น้อยสังข์" },
  { id: "5", vid: "5569", staffName: "นายอุดมศักดิ์ แสงสง่า" },
  { id: "6", vid: "5640", staffName: "นางสาวเกศแก้ว เพิ่มพูล" },
  { id: "7", vid: "5661", staffName: "นายธนเสฏฐ์ ขอดเตชะ" },
  { id: "8", vid: "5666", staffName: "นายอภิชาติ สมัครไทย" },
];

// ### steps (0) ###
const dbArea = [
  {
    id: "1",
    areaName: "ดินแดง",
    areaTime: ["09:00", "19:00"],
    areaType: "NORMAL",
  },
  {
    id: "2",
    areaName: "ดินแดง (บ่าย)",
    areaTime: ["09:00", "19:00"],
    areaType: "NIGHT",
  },
  {
    id: "3",
    areaName: "นางเลิ้ง",
    areaTime: ["09:00", "19:00"],
    areaType: "NORMAL",
  },
  {
    id: "4",
    areaName: "ลุมพินี",
    areaTime: ["09:00", "19:00"],
    areaType: "NORMAL",
  },
  {
    id: "5",
    areaName: "ทองหล่อ",
    areaTime: ["09:00", "19:00"],
    areaType: "NORMAL",
  },
  {
    id: "6",
    areaName: "สาธุประดิษฐ์",
    areaTime: ["09:00", "19:00"],
    areaType: "NORMAL",
  },
  {
    id: "7",
    areaName: "ท่าพระ",
    areaTime: ["09:00", "19:00"],
    areaType: "NORMAL",
  },
];

// ### steps (0) ###
const settingArea = [
  {
    period: "2024-11",
    staffId: "1",
    areaIds: ["1", "2", "3", "7"],
  },
  {
    period: "2024-11",
    staffId: "2",
    areaIds: ["2", "5", "6", "3", "7"],
  },
  {
    period: "2024-11",
    staffId: "3",
    areaIds: ["1", "3", "4", "5", "7"],
  },
  {
    period: "2024-11",
    staffId: "4",
    areaIds: ["2", "4", "5", "7"],
  },
  {
    period: "2024-11",
    staffId: "5",
    areaIds: ["3", "5", "6", "7"],
  },
  {
    period: "2024-11",
    staffId: "6",
    areaIds: ["1", "4", "6", "7"],
  },
  {
    period: "2024-11",
    staffId: "7",
    areaIds: ["1", "2", "6", "7"],
  },
  {
    period: "2024-11",
    staffId: "8",
    areaIds: ["1", "2", "3", "4", "5", "6", "7"],
  },
];
// const settingArea = [
//   {
//     period: "2024-11",
//     staffId: "1",
//     areaIds:  ["1", "2", "3", "4", "5", "6", "7"],
//   },
//   {
//     period: "2024-11",
//     staffId: "2",
//     areaIds:  ["1", "2", "3", "4", "5", "6", "7"],
//   },
//   {
//     period: "2024-11",
//     staffId: "3",
//     areaIds:  ["1", "2", "3", "4", "5", "6", "7"],
//   },
//   {
//     period: "2024-11",
//     staffId: "4",
//     areaIds:  ["1", "2", "3", "4", "5", "6", "7"],
//   },
//   {
//     period: "2024-11",
//     staffId: "5",
//     areaIds:  ["1", "2", "3", "4", "5", "6", "7"],
//   },
//   {
//     period: "2024-11",
//     staffId: "6",
//     areaIds:  ["1", "2", "3", "4", "5", "6", "7"],
//   },
//   {
//     period: "2024-11",
//     staffId: "7",
//     areaIds:  ["1", "2", "3", "4", "5", "6", "7"],
//   },
//   {
//     period: "2024-11",
//     staffId: "8",
//     areaIds: ["1", "2", "3", "4", "5", "6", "7"],
//   },
// ];

// ### steps (0) ###
const dbStaffArea = settingArea.flatMap((s) => {
  return s.areaIds.map((a) => {
    return {
      period: s.period,
      areaId: a,
      staffId: s.staffId,
    };
  });
});
// ### steps (0) ###
const dbStaffLeave = [
  {
    date: moment().startOf("months").format("YYYY-MM-DD"),
    staffId: "1",
    vid: "1304",
    leaveTime: ["00:00", "23:59"],
    leaveType: "ANNUAL LEAVE",
  },
  {
    date: moment().startOf("months").add(2, "days").format("YYYY-MM-DD"),
    staffId: "3",
    vid: "5215",
    leaveTime: ["00:00", "05:00"],
    leaveType: "MEETING",
  },
  {
    date: moment().startOf("months").add(2, "days").format("YYYY-MM-DD"),
    staffId: "8",
    vid: "5666",
    leaveTime: ["00:00", "10:00"],
    leaveType: "MEETING",
  },
  {
    date: moment().startOf("months").add(2, "days").format("YYYY-MM-DD"),
    staffId: "2",
    vid: "5640",
    leaveTime: ["00:00", "05:00"],
    // leaveType: "MEETING",
    leaveType: "ANNUAL LEAVE",
  },
  // {
  //   date: moment().startOf("months").add(2, "days").format("YYYY-MM-DD"),
  //   staffId: "4",
  //   vid: "5533",
  //   leaveTime: ["00:00", "23:00"],
  //   leaveType: "ANNUAL LEAVE",
  // },
  // {
  //   date: moment().startOf("months").add(2, "days").format("YYYY-MM-DD"),
  //   staffId: "5",
  //   vid: "5533",
  //   leaveTime: ["00:00", "23:00"],
  //   leaveType: "ANNUAL LEAVE",
  // },
];

// ### steps (1) ###
const exCludeArea = [
  ["2", "4"],
  ["6"],
  ["1", "3"],
  ["1", "7"],
  ["3"],
  ["5"],
  ["2", "7"],
  ["2", "4"],
  ["6"],
  ["1", "3"],
  ["1", "7"],
  ["3"],
  ["5"],
  ["2", "7"],
  ["2", "4"],
  ["6"],
  ["1", "3"],
  ["1", "7"],
  ["3"],
  ["5"],
  ["2", "7"],
  ["2", "4"],
  ["6"],
  ["1", "3"],
  ["1", "7"],
  ["3"],
  ["5"],
  ["2", "7"],
  ["2", "4"],
  ["6"],
];

// ### steps (1) ###
const dbAreaOpens = exCludeArea.map((_, idx) => {
  return {
    id: `${idx + 1}`,
    date: moment().startOf("months").add(idx, "days").format("YYYY-MM-DD"),
    areaIds: dbArea
      .map((area) => area.id)
      .filter((areaIds) => !exCludeArea[idx].includes(areaIds)),
  };
});

module.exports = {
  settingArea,
  exCludeArea,
  dbAreaOpens,
  dbStaffArea,
  dbStaffLeave,
  dbStaff,
  dbArea,
};
