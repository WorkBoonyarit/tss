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

const retries = (fn, retries) => {
  try {
    return fn();
  } catch (error) {
    console.log("ERROR :: ", error);
    if (retries > 0) {
      console.log(`========  RETRY (${retries}) ========`);
      return fn(retries - 1);
    } else {
      throw new Error("All retries failed");
    }
  }
};

const run = () => {
  console.time("TSS");
  countStaff();
  // validateLeave();
  const result = retries(autoStop, 5);
  // console.log(`🍻 ~ result:::`, result);
  console.timeEnd("TSS");
};

run();
