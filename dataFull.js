const moment = require("moment");

// ### steps (0) ###
const dbStaff = [
  { id: "1", vid: "1304", staffName: "นายธเนศร์ ยาใจ" },
  { id: "2", vid: "5129", staffName: "นายธวัชชัย ขวัญเจริญ" },
  { id: "3", vid: "5215", staffName: "นายนัฐพล ชื่นอารมย์" },
  { id: "4", vid: "5422", staffName: "นายอุดมศักดิ์ แสงสง่า" },
  { id: "5", vid: "5533", staffName: "นางสาวเกศแก้ว เพิ่มพูล" },
  { id: "6", vid: "5569", staffName: "นายธนเสฏฐ์ ขอดเตชะ" },
  { id: "7", vid: "5640", staffName: "นายอภิชาติ สมัครไทย" },
  { id: "8", vid: "5661", staffName: "นายชานนท์ ศุภเชษฐ์พันธ์" },
  { id: "9", vid: "5666", staffName: "นายสมเด็จ เกษตรบัวหลวง" },
  { id: "10", vid: "5696", staffName: "นายเอก งามบุญฤทธิ์" },
  { id: "11", vid: "5707", staffName: "นายจตุพล แก้วบุญส่ง" },
  { id: "12", vid: "5732", staffName: "นายธีรวัฒน์ คำอิ่ม" },
  { id: "13", vid: "5751", staffName: "นายพงศกร จินตนามานัส" },
  { id: "14", vid: "5814", staffName: "นายภาวิน แซ่แต้" },
  { id: "15", vid: "6018", staffName: "นายอนุชา เชื้อจำรูญ" },
  { id: "16", vid: "6217", staffName: "นายธรรมรงค์ โรจน์ชนะศิรประภา" },
  { id: "17", vid: "6229", staffName: "นายณัฐพงษ์ รัตนนุกูล" },
  { id: "18", vid: "6410", staffName: "นายเตธกร ชวโพธิโสภณ" },
  { id: "19", vid: "6427", staffName: "นายปัญญา ปลายเนตร" },
  { id: "20", vid: "6459", staffName: "นายกันธมาศ อ่อนเสมอ" },
  { id: "21", vid: "6461", staffName: "นางสาวสุพรรณา จันจำปา" },
  { id: "22", vid: "6519", staffName: "นายณิชพน วัชรกิตคุณากร" },
  { id: "23", vid: "6520", staffName: "นายยุทธนา แจ้งเกษตร" },
  { id: "24", vid: "6521", staffName: "นายสมคบ อุไรวงษ์" },
  { id: "25", vid: "6525", staffName: "นายกิตติ ยิ้มละมัย" },
  { id: "26", vid: "2206", staffName: "นายธีระพงศ์ เมืองแก้ว" },
  { id: "27", vid: "6622", staffName: "นายนิคม ร่มไทร" },
  { id: "28", vid: "6664", staffName: "นายทรงศร พรจตุรัตนจินดา" },
  { id: "29", vid: "6665", staffName: "นายกุลมิต เครือไชย" },
  { id: "30", vid: "2313", staffName: "นายนพพล ทวีวรรณ์" },
  { id: "31", vid: "2316", staffName: "นายพิรุณ จุลมกร" },
  { id: "32", vid: "2333", staffName: "นายกิตติพงศ์ พันธ์ตะคุ" },
  { id: "33", vid: "2357", staffName: "นายนาถพงศ์ สุขกลั้ง" },
  { id: "34", vid: "2374", staffName: "นายอดิศักดิ์ ยอดสังวาลย์" },
  { id: "35", vid: "6729", staffName: "นายจิรวัฒน์ เรืองใจ" },
  { id: "36", vid: "6750", staffName: "นายเรืองชัย เจริญกิจพงศ์กุล" },
  { id: "37", vid: "6784", staffName: "นายชุติพงศ์ สอนมอญ" },
  { id: "38", vid: "2439", staffName: "นายสิทธิโชค สุริยะ" },
  { id: "39", vid: "2445", staffName: "นายสันติ คำบ่อ" },
  { id: "40", vid: "ES6703", staffName: "นายชนะพล เมืองสุวรรณ" },
  { id: "41", vid: "ES6704", staffName: "นายเจตน์สฤษฎิ์ ม่วงทะนัง" },
  { id: "42", vid: "ES6705", staffName: "นายกรัญณพ ไชยะธน" },
  { id: "43", vid: "ES6706", staffName: "นายกฤตเมธ สิงห์ขามป้อม" },
  { id: "44", vid: "ES6707", staffName: "นายสุทัศน์ มาติน" },
  { id: "45", vid: "ES6708", staffName: "นางสาวทิชากร เกตุชาติ" },
  { id: "46", vid: "ES6710", staffName: "นายฐิติวัฒน์ ธรรมราช" },
];

// ### steps (0) ###
const dbArea = [
  {
    id: "1",
    areaName: "ดินแดง",
    areaTime: ["07:00", "17:00"],
    areaType: "NORMAL",
  },
  {
    id: "2",
    areaName: "ดินแดง (บ่าย)",
    areaTime: ["12:00", "22:00"],
    areaType: "NORMAL",
  },
  {
    id: "3",
    areaName: "นางเลิ้ง",
    areaTime: ["11:00", "21:00"],
    areaType: "NORMAL",
  },
  {
    id: "4",
    areaName: "ลุมพินี",
    areaTime: ["08:00", "18:00"],
    areaType: "NORMAL",
  },
  {
    id: "5",
    areaName: "ทองหล่อ",
    areaTime: ["10:30", "20:30"],
    areaType: "NORMAL",
  },
  {
    id: "6",
    areaName: "สาธุประดิษฐ์",
    areaTime: ["08:30", "18:30"],
    areaType: "NORMAL",
  },
  {
    id: "7",
    areaName: "ท่าพระ",
    areaTime: ["08:00", "18:00"],
    areaType: "NORMAL",
  },
  {
    id: "8",
    areaName: "บางแค-ภาษีเจริญ",
    areaTime: ["07:30", "17:30"],
    areaType: "NORMAL",
  },
  {
    id: "9",
    areaName: "โลตัส พระราม2",
    areaTime: ["08:00", "18:00"],
    areaType: "NORMAL",
  },
  {
    id: "10",
    areaName: "โลตัส บางปะกอก",
    areaTime: ["11:00", "21:00"],
    areaType: "NORMAL",
  },
  {
    id: "11",
    areaName: "ตลิ่งชัน",
    areaTime: ["09:00", "19:00"],
    areaType: "NORMAL",
  },
  {
    id: "12",
    areaName: "โลตัสบางใหญ่",
    areaTime: ["12:00", "22:00"],
    areaType: "NORMAL",
  },
  {
    id: "13",
    areaName: "สี่แยกติวานนท์",
    areaTime: ["07:00", "17:00"],
    areaType: "NORMAL",
  },
  {
    id: "14",
    areaName: "แยกลาดพร้าว",
    areaTime: ["07:30", "17:30"],
    areaType: "NORMAL",
  },
  {
    id: "15",
    areaName: "เซ็นทรัลอีสต์วิลล์",
    areaTime: ["12:00", "22:00"],
    areaType: "NORMAL",
  },
  {
    id: "16",
    areaName: "แยกห้วยขวาง",
    areaTime: ["10:00", "20:00"],
    areaType: "NORMAL",
  },
  {
    id: "17",
    areaName: "เซ็นทรัลแจ้งวัฒนะ",
    areaTime: ["08:00", "18:00"],
    areaType: "NORMAL",
  },
  {
    id: "18",
    areaName: "เซ็นทรัลรามอินทรา",
    areaTime: ["10:30", "20:30"],
    areaType: "NORMAL",
  },
  {
    id: "19",
    areaName: "รังสิต",
    areaTime: ["07:30", "17:30"],
    areaType: "NORMAL",
  },
  {
    id: "20",
    areaName: "สภ.คูคต",
    areaTime: ["11:00", "21:00"],
    areaType: "NORMAL",
  },
  {
    id: "21",
    areaName: "แยกคู้บอน",
    areaTime: ["07:00", "17:00"],
    areaType: "NORMAL",
  },
  {
    id: "22",
    areaName: "บางกะปิ",
    areaTime: ["07:30", "17:30"],
    areaType: "NORMAL",
  },
  {
    id: "23",
    areaName: "แยกมีนบุรี",
    areaTime: ["11:00", "21:00"],
    areaType: "NORMAL",
  },
  {
    id: "24",
    areaName: "พัฒนาการ",
    areaTime: ["08:30", "18:30"],
    areaType: "NORMAL",
  },
  {
    id: "25",
    areaName: "ศรีนครินทร์",
    areaTime: ["07:00", "17:00"],
    areaType: "NORMAL",
  },
  {
    id: "26",
    areaName: "โลตัสศรีนครินทร์",
    areaTime: ["11:30", "21:30"],
    areaType: "NORMAL",
  },
  {
    id: "27",
    areaName: "บางพลี",
    areaTime: ["08:30", "18:30"],
    areaType: "NORMAL",
  },
  {
    id: "28",
    areaName: "แยกประเวศ",
    areaTime: ["11:00", "20:00"],
    areaType: "NORMAL",
  },
  {
    id: "29",
    areaName: "ไอคอนสยาม",
    areaTime: ["12:00", "22:00"],
    areaType: "NORMAL",
  },
  {
    id: "30",
    areaName: "แม็คโคร บางบอน",
    areaTime: ["11:00", "21:00"],
    areaType: "NORMAL",
  },
  {
    id: "31",
    areaName: "บิ๊กซี สุขสวัสดิ์",
    areaTime: ["07:00", "16:00"],
    areaType: "NORMAL",
  },
  {
    id: "32",
    areaName: "แม็คโคร สามเสน",
    areaTime: ["06:30", "15:30"],
    areaType: "NORMAL",
  },
  {
    id: "33",
    areaName: "เซ็นทรัล เวสต์เกต",
    areaTime: ["08:00", "17:00"],
    areaType: "NORMAL",
  },
  {
    id: "34",
    areaName: "แยกมีนบุรี",
    areaTime: ["12:00", "21:00"],
    areaType: "NORMAL",
  },
];

// ### steps (0) ###
const settingArea = [
  {
    period: "2024-11",
    staffId: "1",
    areaIds: ["20", "18", "8", "30", "21", "9"],
  },
  {
    period: "2024-11",
    staffId: "2",
    areaIds: ["25", "13", "28", "6", "4", "10"],
  },
  {
    period: "2024-11",
    staffId: "3",
    areaIds: ["20", "18", "26", "15", "17", "16"],
  },
  {
    period: "2024-11",
    staffId: "4",
    areaIds: ["22", "9", "30", "27", "20", "28"],
  },
  {
    period: "2024-11",
    staffId: "5",
    areaIds: ["25", "8", "14", "32", "18", "27"],
  },
  {
    period: "2024-11",
    staffId: "6",
    areaIds: ["11", "4", "3", "2", "7", "28"],
  },
  {
    period: "2024-11",
    staffId: "7",
    areaIds: ["22", "32", "15", "30", "33", "25"],
  },
  {
    period: "2024-11",
    staffId: "8",
    areaIds: ["2", "16", "24", "9", "19", "6"],
  },
  {
    period: "2024-11",
    staffId: "9",
    areaIds: ["9", "34", "5", "16", "16", "22"],
  },
  {
    period: "2024-11",
    staffId: "10",
    areaIds: ["28", "4", "34", "29", "19", "23"],
  },
  {
    period: "2024-11",
    staffId: "11",
    areaIds: ["24", "20", "27", "19", "14", "31"],
  },
  {
    period: "2024-11",
    staffId: "12",
    areaIds: ["8", "15", "14", "14", "13", "17"],
  },
  {
    period: "2024-11",
    staffId: "13",
    areaIds: ["6", "21", "20", "13", "13", "21"],
  },
  {
    period: "2024-11",
    staffId: "14",
    areaIds: ["5", "8", "33", "16", "21", "13"],
  },
  {
    period: "2024-11",
    staffId: "15",
    areaIds: ["10", "21", "2", "26", "13", "23"],
  },
  {
    period: "2024-11",
    staffId: "16",
    areaIds: ["6", "15", "8", "12", "21", "16"],
  },
  {
    period: "2024-11",
    staffId: "17",
    areaIds: ["22", "29", "26", "25", "32", "8"],
  },
  {
    period: "2024-11",
    staffId: "18",
    areaIds: ["18", "20", "23", "15", "9", "24"],
  },
  {
    period: "2024-11",
    staffId: "19",
    areaIds: ["8", "30", "3", "18", "30", "5"],
  },
  {
    period: "2024-11",
    staffId: "20",
    areaIds: ["1", "3", "31", "19", "5", "28"],
  },
  {
    period: "2024-11",
    staffId: "21",
    areaIds: ["5", "7", "28", "11", "17", "2"],
  },
  {
    period: "2024-11",
    staffId: "22",
    areaIds: ["34", "12", "18", "2", "5", "27"],
  },
  {
    period: "2024-11",
    staffId: "23",
    areaIds: ["4", "31", "32", "28", "24", "1"],
  },
  {
    period: "2024-11",
    staffId: "24",
    areaIds: ["12", "27", "7", "34", "14", "25"],
  },
  {
    period: "2024-11",
    staffId: "25",
    areaIds: ["1", "14", "19", "34", "26", "15"],
  },
  {
    period: "2024-11",
    staffId: "26",
    areaIds: ["31", "22", "32", "23", "10", "27"],
  },
  {
    period: "2024-11",
    staffId: "27",
    areaIds: ["1", "20", "26", "7", "2", "5"],
  },
  {
    period: "2024-11",
    staffId: "28",
    areaIds: ["10", "11", "32", "5", "17", "3"],
  },
  {
    period: "2024-11",
    staffId: "29",
    areaIds: ["33", "10", "17", "1", "21", "20"],
  },
  {
    period: "2024-11",
    staffId: "30",
    areaIds: ["12", "17", "6", "22", "29", "33"],
  },
  {
    period: "2024-11",
    staffId: "31",
    areaIds: ["19", "25", "7", "10", "30", "34"],
  },
  {
    period: "2024-11",
    staffId: "32",
    areaIds: ["23", "7", "23", "27", "30", "28"],
  },
  {
    period: "2024-11",
    staffId: "33",
    areaIds: ["15", "26", "19", "29", "22", "14"],
  },
  {
    period: "2024-11",
    staffId: "34",
    areaIds: ["33", "6", "17", "10", "5", "32"],
  },
  {
    period: "2024-11",
    staffId: "35",
    areaIds: ["26", "8", "3", "31", "11", "29"],
  },
  {
    period: "2024-11",
    staffId: "36",
    areaIds: ["6", "33", "28", "11", "12", "3"],
  },
  {
    period: "2024-11",
    staffId: "37",
    areaIds: ["24", "24", "31", "34", "18", "17"],
  },
  {
    period: "2024-11",
    staffId: "38",
    areaIds: ["21", "27", "33", "10", "15", "3"],
  },
  {
    period: "2024-11",
    staffId: "39",
    areaIds: ["23", "23", "18", "24", "22", "7"],
  },
  {
    period: "2024-11",
    staffId: "40",
    areaIds: ["31", "17", "12", "13", "14", "10"],
  },
  {
    period: "2024-11",
    staffId: "41",
    areaIds: ["1", "25", "19", "31", "4", "1"],
  },
  {
    period: "2024-11",
    staffId: "42",
    areaIds: ["4", "33", "7", "9", "3", "3"],
  },
  {
    period: "2024-11",
    staffId: "43",
    areaIds: ["6", "19", "16", "33", "15", "14"],
  },
  {
    period: "2024-11",
    staffId: "44",
    areaIds: ["27", "12", "1", "11", "2", "2"],
  },
  {
    period: "2024-11",
    staffId: "45",
    areaIds: ["11", "2", "32", "30", "9", "29"],
  },
  {
    period: "2024-11",
    staffId: "46",
    areaIds: ["16", "29", "4", "29", "25", "11"],
  },
];
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
  ["2", "4", "12", "15", "16", "20", "23", "28", "33"], //1
  ["28", "34", "35", "36"], // 2
  ["28", "34", "35", "36"], // 3
  ["32", "35", "36"], // 4
  ["28", "31", "33", "35", "36"], // 5
  ["28", "35", "36"], // 6
  ["12", "16", "28", "31", "34", "36"], // 7
  ["2", "4", "12", "15", "16", "20", "23", "28", "33"], // 8
  ["34", "35", "36"], // 9
  ["28", "34", "35", "36"], // 10
  ["28", "31", "34", "35", "36"], // 11
  ["28", "31", "34", "35", "36"], // 12
  ["28", "31", "35", "36"], // 13
  ["16", "28", "31", "34", "36"], // 14
  ["2", "4", "12", "15", "16", "20", "23", "28", "33"], //15
  ["28", "34", "35", "36"], // 16
  ["28", "34", "35", "36"], // 17
  ["32", "35", "36"], // 18
  ["28", "31", "33", "35", "36"], // 19
  ["28", "35", "36"], // 20
  ["12", "16", "28", "31", "34", "36"], // 21
  ["2", "4", "12", "15", "16", "20", "23", "28", "33"], // 22
  ["34", "35", "36"], // 23
  ["28", "34", "35", "36"], // 24
  ["28", "31", "34", "35", "36"], // 25
  ["28", "31", "34", "35", "36"], // 26
  ["28", "31", "35", "36"], // 27
  ["16", "28", "31", "34", "36"], // 28
  ["2", "4", "12", "15", "16", "20", "23", "28", "33"], //29
  ["28", "34", "35", "36"], // 30
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
