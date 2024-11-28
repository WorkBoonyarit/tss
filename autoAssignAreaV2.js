const isDev = require('./isDev');
const { dbArea, dbAreaOpens, exCludeArea, dbStaffLeave, dbStaffArea, dbStaff } = isDev ? require('./data') : require('./dataFull');
const moment = require('moment');
const lodash = require('lodash');
const { getAreaTime, getVidStaff } = require('./helper');

module.exports = (autoStopResult) => {
  const showLog = false;
  const nowPeriod = moment().format('YYYY-MM');

  const results = [];
  const retrySemiTime = 300;
  const reportsNotFound = [];

  const autoAssignArea = (nowDate, areaOpenLists, staffLeaveInToday, staffAutoStopInToDay, timeRetries) => {
    try {
      const tempStaffWork = [];
      const tempReportAreaNotFound = [];
      areaOpenLists.forEach((areaOpen) => {
        showLog && console.log(`🍻 ~ ^^^^^^^^^^^^^^^^^^ พื้นที่ ::: ${areaOpen}  ::: ^^^^^^^^^^^^^^^^^^`);
        const todayStaffWorkIds = tempStaffWork.map((wl) => wl.staffId);
        showLog && console.log(`🍻 ~ พนักงานที่ได้พื้นที่ไปแล้ว:::`, todayStaffWorkIds);
        showLog &&
          console.log(
            `📍  พนักงานที่เลือกพื้นที่นี้ไว้ `,
            dbStaffArea.filter((staff) => staff.areaId === areaOpen && staff.period === nowPeriod).map((staff) => staff.staffId)
          );

        const areaTime = getAreaTime(areaOpen);
        showLog && console.log(`🍻 ~ เวลาเข้าเวรของพื้นที่นี้:::`, areaTime);
        const staffNotAvailable = staffLeaveInToday
          .filter((staffLeave) => {
            const isLeaveAnnual = staffLeave.leaveType === 'ANNUAL LEAVE';
            const isLeaveMeeting = staffLeave.leaveType === 'MEETING';
            const isLeaveInAreaTime = staffLeave.leaveTime[1] > areaTime[0] && staffLeave.leaveTime[0] < areaTime[1];

            const isLeaveEqualAreaTime = staffLeave.leaveTime[0] === areaTime[0] && staffLeave.leaveTime[1] === areaTime[1];
            return isLeaveAnnual || (isLeaveMeeting && (isLeaveInAreaTime || isLeaveEqualAreaTime));
          })
          .map((staffLeave) => staffLeave.staffId);

        showLog && console.log(`💤 ~ พนักงานที่ไม่สามารถทำงานในพื้นที่นี้ได้:::`, staffNotAvailable);

        const staffCanWorkInArea = dbStaffArea
          .filter((staffArea) => staffArea.areaId === areaOpen && staffArea.period === nowPeriod && !staffNotAvailable.includes(staffArea.staffId))
          .map((staffArea) => staffArea.staffId);

        showLog && console.log(`📍  พนักงานที่เลือกพื้นที่นี้ไว้และไม่ได้ลาชนกับช่วงเวลาพื้นที่`, staffCanWorkInArea);

        // เงื่อนไขที่ยอมไม่ได้ ต้อง 100%
        const candidateStaff = staffCanWorkInArea.filter((staffId) => !todayStaffWorkIds.includes(staffId) && !staffAutoStopInToDay.includes(staffId));

        showLog && console.log(`✅ ~ พนักงานที่สามารถลงพื้นที่นี้ได้ และยังไม่ได้ลงพื้นที่ไหนเลย:::`, candidateStaff);

        const theChosenOne = lodash.shuffle(candidateStaff)[0];
        if (!theChosenOne && timeRetries > 0) {
          throw new Error(`❌ ในวันที่ :: ${nowDate} :: พื้นที่ :: (${areaOpen}) :: ไม่สามารถจัดพนักงานลงได้ ::`);
        }
        if (!theChosenOne && timeRetries === 0) {
          tempReportAreaNotFound.push({ nowDate, areaOpen, staffCanWorkInArea: staffCanWorkInArea.map((staff) => getVidStaff(staff)) });
        }

        showLog && console.log(`🚙 ~ พนักงานที่โดนเลือก :::`, theChosenOne);
        tempStaffWork.push({ areaId: areaOpen, staffId: theChosenOne });
      });

      reportsNotFound.push(...tempReportAreaNotFound);

      return tempStaffWork;
    } catch (error) {
      if (timeRetries >= 0) {
        showLog && console.log(`========  RETRY ${nowDate} ภายในวัน (${retrySemiTime - timeRetries}) ========`);
        const resultRetry = autoAssignArea(nowDate, areaOpenLists, staffLeaveInToday, staffAutoStopInToDay, timeRetries - 1);
        return resultRetry;
      } else {
        return [];
      }
    }
  };

  Array(exCludeArea.length)
    .fill('')
    .forEach((_, days) => {
      showLog && console.log(`🍻 ~ =================================================:`);
      const nowDate = moment().startOf('months').add(days, 'days').format('YYYY-MM-DD');

      console.log(`🍻 ~ nowDate:::`, nowDate);
      const areaOpenLists = dbAreaOpens.find((areaOpen) => areaOpen.date === nowDate).areaIds;

      showLog && console.log(`🍻 ~ พื้นที่ที่เปิด::: ${areaOpenLists}`);

      const staffLeaveInToday = dbStaffLeave.filter((staff) => staff.date === nowDate);

      const staffAutoStopInToDay = autoStopResult
        .map((stop) => {
          const currentDateIsStop = stop.calendar.find((c) => c.isStop && c.date === nowDate);
          if (currentDateIsStop) {
            return stop.staffData.id;
          }
        })
        .filter((staff) => !!staff);

      const tempStaffWork = autoAssignArea(nowDate, areaOpenLists, staffLeaveInToday, staffAutoStopInToDay, retrySemiTime);

      showLog && console.log(`🍻 ~ ผลลัพธ์::: ${JSON.stringify(tempStaffWork, null, 2)}`);

      // reports
      results.push({
        date: nowDate,
        staffWork: tempStaffWork,
      });
    });

  // !showLog && console.log(`🎁 ~ ผลลัพธ์ ::: ${JSON.stringify(results, null, 2)}`);
  // console.log('reportsNotFound', reportsNotFound);
  return { results, reportsNotFound };
};
