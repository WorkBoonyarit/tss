/**
 * 0. set ข้อมูลพนักงาน / ข้อมูลพื้นที่ / ข้อมูลที่พนักงานสามารถประจำที่ไหนได้บ้าง
 * 1. set จุดก่อนจะได้จำนวนพื้นที่ที่ต้องการ
 * 2. ดูเรื่องของวันลาของพนักงาน พร้อมกับ validate ว่าเพียงพอกับพื้นที่หรือไม่
 * 3. มาดูเรื่องของ auto วันหยุดให้พนักงาน ในกรณีที่พนักงานมีมากกว่าพื้นที่ ที่เปิด
 */

const { areaOpens } = require("./data");
const validateLeave = require("./leave");
const autoStop = require("./autoStop");
const countStaff = require("./countStaff");
const { mapStaffStop, mapStaffWork, getAreaName } = require("./helper");
const logUsage = require("./logUsage");
const retryTime = 100;
const areaCannotAssign = {};

const retries = (fn, times) => {
  try {
    return fn();
  } catch (error) {
    console.log("ERROR :: ", error);
    const match = error.toString().match(/\(([^)]+)\)/);
    const area = match ? match[1] : null;
    areaCannotAssign[area] = {
      areaId: area,
      areaName: getAreaName(area),
      count: (areaCannotAssign?.[area]?.count || 0) + 1,
    };

    if (times >= 0) {
      console.log(`========  RETRY (${retryTime - times}) ========`);
      return retries(fn, times - 1);
    } else {
      logUsage("After Execution");
      throw new Error("All retries failed");
    }
  }
};

const run = () => {
  logUsage("Before Execution");

  countStaff();
  // validateLeave();
  const { results, historyAllStop } = retries(autoStop, retryTime - 1);
  results.forEach((r) => {
    console.log(r.date);
    console.table(mapStaffWork(r.staffWork));
    console.table(mapStaffStop(r.staffStop));
  });
  console.log("วันหยุดของ staff จำนวนครั้ง");
  console.table(historyAllStop);
  console.log("พื้นที่ ที่ไม่สามารถหา staff ได้");
  console.table(areaCannotAssign);
  logUsage("After Execution");
};

run();
