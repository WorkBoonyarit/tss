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
const { mapStaffStop, mapStaffWork } = require("./helper");
const logUsage = require("./logUsage");

const retries = (fn, times) => {
  try {
    logUsage("After Execution");
    return fn();
  } catch (error) {
    console.log("ERROR :: ", error);
    if (times > 0) {
      console.log(`========  RETRY (${times}) ========`);
      logUsage("After Execution");
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
  const result = retries(autoStop, 9);
  // result.forEach((r) => {
  //   console.log(r.date);
  //   console.table(mapStaffWork(r.staffWork));
  //   console.table(mapStaffStop(r.staffStop));
  // });
};

run();
