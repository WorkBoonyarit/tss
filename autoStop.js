const isDev = require('./isDev');
const { exCludeArea, dbStaff } = isDev ? require('./data') : require('./dataFull');
const moment = require('moment');

module.exports = () => {
  const showLog = false;
  const autoMonth = Math.floor(exCludeArea.length / 30);
  const minStopPerMonth = autoMonth * 10; // คูณเยอะจะยิ่งทำให้หยุดถี่ขึ้น
  const maxStop = 2; // หยุดต่อกันได้มากสุด 2 ครั้ง
  const maxToWork = 5; // ทำงานมากสุด 5 วัน / รอบการทำงาน

  const staffAutoStop = dbStaff.map((staff) => ({
    staffData: staff,
    calendar: [],
  }));

  const randomStop = (idx, staffId) => {
    const result = Math.floor(Math.random() * 100) + 1;
    if (idx < maxToWork - 1) {
      return [result < 30, 'RANDOM'];
    }

    const currentStaffData = staffAutoStop.find((staff) => staff.staffData.id === staffId);
    const countStaffStop = currentStaffData.calendar.filter((date) => date.isStop).length;

    const percentStopDay = 100 - Math.floor((countStaffStop * 100) / minStopPerMonth); //  หยุดขั้นต่ำ x วัน = 0% (ยิ่งหยุดเยอะ % ยิ่งน้อย)
    const percentDate = Math.floor((idx * 100) / exCludeArea.length); // วันที่ 30 วัน = 100% (ยิ่งวันท้ายๆ % ยิ่งเยอะ)
    const summary = percentDate + percentStopDay;
    const percent = Math.floor((summary * 100) / 200);

    if (percentStopDay <= 0) {
      return [false, `วันหยุดครบขั้นต่ำแล้ว`];
    }
    if (percentDate > 90 && countStaffStop / autoMonth < minStopPerMonth) {
      return [true, 'FORCE STOP'];
    }

    return [
      result < (percent > 100 ? 100 : percent),
      `result:: ${result} :: จำนวนวันหยุด :: ${countStaffStop} :: วันที่ได้หยุดไป :: ${percentStopDay} :: วันที่ :: ${percentDate} :: % :: ${percent}`,
    ];
  };

  const getIndexStaff = (staffId) => {
    return staffAutoStop.findIndex((staffAuto) => staffAuto.staffData.id === staffId);
  };

  const workExceedQuota = (idx, staffId) => {
    const staffIndex = getIndexStaff(staffId);
    const idxYesterday = idx - 1;
    let i = idxYesterday;
    let dataWork = [];
    while (i > idxYesterday - maxToWork) {
      dataWork.push(staffAutoStop[staffIndex].calendar[i]);

      i--;
    }
    return dataWork.every((leave) => !leave.isStop);
  };

  const leaveExceedQuota = (idx, staffId) => {
    const staffIndex = getIndexStaff(staffId);
    const idxYesterday = idx - 1;
    let i = idxYesterday;
    let dataLeave = [];
    while (i > idxYesterday - maxStop) {
      dataLeave.push(staffAutoStop[staffIndex].calendar[i]);

      i--;
    }
    return dataLeave.every((leave) => leave.isStop);
  };

  const shouldWorkContinue = (idx, staffId) => {
    const staffIndex = getIndexStaff(staffId);
    const idxYesterday = idx - 1;
    let indexCalendar = idxYesterday;

    let dataWorkContinue = [];
    while (indexCalendar > idx - 3) {
      dataWorkContinue.push(staffAutoStop[staffIndex].calendar[indexCalendar]);

      indexCalendar--;
    }
    showLog && console.log(`🍻 ~ dataWorkContinue:::`, dataWorkContinue);
    if (dataWorkContinue.every((data) => data.isStop === false)) {
      return false;
    }
    return staffAutoStop[staffIndex].calendar[idx - 1].isStop === false;
  };

  const getStop = (idx, staffId) => {
    showLog && console.log(`🍻 ~ idx:::`, idx);
    const [randResult, messageRand] = randomStop(idx + 1, staffId);

    if (idx < maxToWork - 1) {
      return [randResult, `RANDOM !! :: ${messageRand}`];
    }

    const isShouldWorkContinue = idx > 0 && shouldWorkContinue(idx, staffId);

    const isLeaveExceedQuota = idx >= maxStop && leaveExceedQuota(idx, staffId);

    const isWorkExceedQuota = idx >= maxToWork && workExceedQuota(idx, staffId);

    showLog && console.log(`🍻 ~ isWorkExceedQuota:::`, isWorkExceedQuota);
    showLog && console.log(`🍻 ~ isLeaveExceedQuota:::`, isLeaveExceedQuota);
    showLog && console.log(`🍻 ~ isShouldWorkContinue:::`, isShouldWorkContinue);

    if (isWorkExceedQuota) {
      return [true, 'ทำงานเกินโควต้า'];
    }
    if (isLeaveExceedQuota) {
      return [false, 'หยุดเกินโควต้า'];
    }
    if (isShouldWorkContinue) {
      return [false, 'ให้ทำงานต่อเนื่อง'];
    }
    showLog && console.log(`RANDOM !! :: ${messageRand}`);
    return [randResult, `RANDOM !! :: ${messageRand}`];
  };

  dbStaff.forEach((staff) => {
    Array(exCludeArea.length)
      .fill('')
      .forEach((_, idx) => {
        const nowDate = moment().startOf('months').add(idx, 'days').format('YYYY-MM-DD');

        showLog && console.log(`🍻 ~ nowDate:::`, nowDate);
        const [isStop, message] = getStop(idx, staff.id);
        showLog && console.log(`🍻 ~ isStop:::`, isStop);
        showLog && console.log(`🍻 ~ ==================:::`);
        const staffIndex = getIndexStaff(staff.id);

        staffAutoStop[staffIndex].calendar.push({ date: nowDate, isStop, message });
      });
  });

  // !showLog && console.log(`🍻 ~ staffAutoStop:::`, JSON.stringify(staffAutoStop, null, 2));

  return staffAutoStop;
};
