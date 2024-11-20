const isDev = require("./isDev");
const { dbArea, dbAreaOpens, exCludeArea, dbStaffLeave, dbStaffArea, dbStaff } =
  isDev ? require("./data") : require("./dataFull");
const moment = require("moment");
const lodash = require("lodash");
const mapping = require("./helper");

module.exports = () => {
  const showLog = false;
  const nowPeriod = moment().format("YYYY-MM");

  const results = [];

  let staffWorkInYesterDay = []; // สำหรับเงื่อนไข ห่างจากเวรที่แล้ว 12 ชั่วโมง (ยกเว้นไม่มีคนจริงๆ)
  let staffLeaveYesterDayIds = []; // สำหรับ ได้หยุดต่อเนื่อง 2 วัน ไม่เอาพนักงานที่หยุดในเมื่อวานมาทำ (ยกเว้นไม่มีคนจริงๆ)
  let staffNotWorkExceedQuotaIds = []; //สำหรับเงื่อนไข ทำงานไม่เกิน 5 วัน / 1 รอบการทำงาน (เอา staff ที่เกิน 5 วันออกทุกกรณี)
  let workStaffIds = []; //สำหรับเงื่อนไข ทำงานขั้นต่ำ 2 วัน / 1 รอบการทำงาน (จับมาเลือกก่อน)
  let leaveStaffIds = []; // สำหรับควรหยุดไม่เกิน 2 วัน (จับมาเลือกก่อน)
  const historyAllStop = {};
  const retrySemiTime = 10;

  const getAreaTime = (areaOpen) => {
    return dbArea.find((area) => area.id === areaOpen)?.areaTime;
  };

  const findStaffInTwelveHrs = (areaTime) => {
    const startTime = areaTime[0];
    return staffWorkInYesterDay
      .filter((staffArea) => {
        const [endTime] = getAreaTime(staffArea.areaId);
        const [hrs, min] = endTime.split(":");
        const nextTimeCanWork = moment()
          .set("hours", hrs)
          .set("minutes", min)
          .set("seconds", 0)
          .add(12, "hours")
          .format("HH:mm");

        return nextTimeCanWork <= startTime;
      })
      .map((staff) => staff.staffId);
  };

  const findExceedQuotaWork = (threshold = 4) => {
    // 5 days
    const frequencyMap = new Map();

    staffNotWorkExceedQuotaIds.forEach((num) => {
      frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
    });

    const result = Array.from(frequencyMap.entries())
      .filter(([num, count]) => count > threshold)
      .map(([num]) => num);

    return result;
  };
  const getOverTwoDaysLeave = () => {
    return lodash.uniq(duplicates([...leaveStaffIds]));
  };

  const duplicates = (arr) =>
    arr.filter((item, index) => arr.indexOf(item) !== index);

  const shuffleStaff = (
    candidateStaff,
    nextCandidateStaff,
    msg,
    shuffle = true,
    icon
  ) => {
    if (nextCandidateStaff.length > 0) {
      showLog &&
        console.log(
          `${icon} ~ [เลือกพนักงาน] => ${msg} :::`,
          nextCandidateStaff
        );
      return shuffle
        ? lodash.shuffle(nextCandidateStaff)[0]
        : nextCandidateStaff[0];
    } else {
      showLog &&
        console.log(
          `🔴 ~ [เลือกพนักงาน] => ต้องใช้พนักงานทุกคนที่สามารถทำได้ :::`,
          candidateStaff
        );

      return lodash.shuffle(candidateStaff)[0];
    }
  };

  const pickStaff = (candidateStaff, staffInTwelveHrs) => {
    let staffOverLeave = getOverTwoDaysLeave();

    let staffPickFirst = lodash.uniq([...staffOverLeave, ...workStaffIds]);

    showLog &&
      console.log(`🍻 ~ พนักงานที่ได้หยุดครบ 2 วันแล้ว:::`, staffOverLeave);
    showLog &&
      console.log(`🍻 ~ พนักงานที่ได้ทำงานในวันที่ผ่านมา :::`, workStaffIds);
    showLog &&
      console.log(`🍻 ~ ต้องเลือกพนักงานกลุ่มนี้ก่อน:::`, staffPickFirst);

    if (staffPickFirst.length > 0) {
      const nextCandidateStaff = staffPickFirst.filter((staff) =>
        candidateStaff.includes(staff)
      );

      const msg =
        "พนักงานที่สามารถทำงานต่อเนื่องได้ หรือ พนักงานที่หยุดเกิน 2 วัน";
      const resultPick = shuffleStaff(
        candidateStaff,
        nextCandidateStaff,
        msg,
        false,
        "🔵"
      );
      workStaffIds = workStaffIds.filter((staff) => staff !== resultPick);
      leaveStaffIds = leaveStaffIds.filter((staff) => staff !== resultPick);
      return resultPick;
    } else {
      const nextCandidateStaff = candidateStaff.filter(
        (staff) => !staffLeaveYesterDayIds.includes(staff)
        // && !staffInTwelveHrs.includes(staff)
      );
      showLog &&
        console.log(
          `⛔️ ~ พนักงานที่ได้หยุดเมื่อวาน :::`,
          staffLeaveYesterDayIds
        );
      showLog &&
        console.log(
          `🍻 ~ ตัดพนักงานที่ได้หยุดเมื่อวานคงเหลือ :::`,
          nextCandidateStaff
        );
      const msg = "พยายามไม่เลือกใช้พนักงานที่ได้หยุดเมืื่อวาน คงเหลือ";
      return shuffleStaff(candidateStaff, nextCandidateStaff, msg, true, "🟢");
    }
  };

  const autoAssignArea = (
    nowDate,
    areaOpenLists,
    staffLeaveInToday,
    timeRetries
  ) => {
    try {
      console.log(`🍻 ~ nowDate:::`, nowDate);
      const tempStaffWork = [];
      areaOpenLists.forEach((areaOpen) => {
        showLog &&
          console.log(
            `🍻 ~ ^^^^^^^^^^^^^^^^^^ พื้นที่ ::: ${areaOpen}  ::: ^^^^^^^^^^^^^^^^^^`
          );
        const todayStaffWorkIds = tempStaffWork.map((wl) => wl.staffId);
        showLog &&
          console.log(`🍻 ~ พนักงานที่ได้พื้นที่ไปแล้ว:::`, todayStaffWorkIds);
        showLog &&
          console.log(
            `📍  พนักงานที่เลือกพื้นที่นี้ไว้ `,
            dbStaffArea
              .filter(
                (staff) =>
                  staff.areaId === areaOpen && staff.period === nowPeriod
              )
              .map((staff) => staff.staffId)
          );

        const areaTime = getAreaTime(areaOpen);
        showLog && console.log(`🍻 ~ เวลาเข้าเวรของพื้นที่นี้:::`, areaTime);

        const staffNotAvailable = staffLeaveInToday
          .filter((staffLeave) => {
            const isLeaveAnnual = staffLeave.leaveType === "ANNUAL LEAVE";
            const isLeaveMeeting = staffLeave.leaveType === "MEETING";
            const isLeaveInAreaTime =
              staffLeave.leaveTime[1] > areaTime[0] &&
              staffLeave.leaveTime[0] < areaTime[1];

            const isLeaveEqualAreaTime =
              staffLeave.leaveTime[0] === areaTime[0] &&
              staffLeave.leaveTime[1] === areaTime[1];
            return (
              isLeaveAnnual ||
              (isLeaveMeeting && (isLeaveInAreaTime || isLeaveEqualAreaTime))
            );
          })
          .map((staffLeave) => staffLeave.staffId);

        showLog &&
          console.log(
            `💤 ~ พนักงานที่ไม่สามารถทำงานในพื้นที่นี้ได้:::`,
            staffNotAvailable
          );

        const staffCanWorkInArea = dbStaffArea
          .filter(
            (staffArea) =>
              staffArea.areaId === areaOpen &&
              staffArea.period === nowPeriod &&
              !staffNotAvailable.includes(staffArea.staffId)
          )
          .map((staffArea) => staffArea.staffId);

        showLog &&
          console.log(
            `📍  พนักงานที่เลือกพื้นที่นี้ไว้และไม่ได้ลาชนกับช่วงเวลาพื้นที่`,
            staffCanWorkInArea
          );

        const staffExceedWorkQuota = findExceedQuotaWork();

        showLog &&
          console.log(
            `🍻 ~ พนักงานที่ทำงานเกิน 5 วัน:::`,
            staffExceedWorkQuota
          );

        const staffInTwelveHrs = findStaffInTwelveHrs(areaTime);
        showLog &&
          console.log(
            `🍻 ~ เงื่อนไข 12 ชั่วโมงจากเวรที่แล้ว:::`,
            staffInTwelveHrs
          );

        const candidateStaff = staffCanWorkInArea.filter(
          (staffId) =>
            !todayStaffWorkIds.includes(staffId) &&
            !staffExceedWorkQuota.includes(staffId) &&
            !staffInTwelveHrs.includes(staffId)
        );

        showLog &&
          console.log(
            `✅ ~ พนักงานที่สามารถลงพื้นที่นี้ได้ และยังไม่ได้ลงพื้นที่ไหนเลย:::`,
            candidateStaff
          );

        const theChosenOne = pickStaff(candidateStaff, staffInTwelveHrs);
        if (!theChosenOne) {
          throw new Error(
            `❌ ในวันที่ :: ${nowDate} :: พื้นที่ :: (${areaOpen}) :: ไม่สามารถจัดพนักงานลงได้ ::`
          );
        }

        showLog && console.log(`🚙 ~ พนักงานที่โดนเลือก :::`, theChosenOne);
        tempStaffWork.push({ areaId: areaOpen, staffId: theChosenOne });
      });

      return tempStaffWork;
    } catch (error) {
      if (timeRetries >= 0) {
        console.log(
          `========  RETRY ${nowDate} ภายในวัน (${
            retrySemiTime - timeRetries
          }) ========`
        );
        return autoAssignArea(
          nowDate,
          areaOpenLists,
          staffLeaveInToday,
          timeRetries - 1
        );
      } else {
        throw new Error(error?.message || "");
      }
    }
  };

  Array(exCludeArea.length)
    .fill("")
    .forEach((_, days) => {
      showLog &&
        console.log(`🍻 ~ =================================================:`);
      const nowDate = moment()
        .startOf("months")
        .add(days, "days")
        .format("YYYY-MM-DD");

      showLog && console.log(`🍻 ~ nowDate:::`, nowDate);
      const areaOpenLists = dbAreaOpens.find(
        (areaOpen) => areaOpen.date === nowDate
      ).areaIds;

      showLog && console.log(`🍻 ~ พื้นที่ที่เปิด::: ${areaOpenLists}`);

      const staffLeaveInToday = dbStaffLeave.filter(
        (staff) => staff.date === nowDate
      );

      const tempStaffWork = autoAssignArea(
        nowDate,
        areaOpenLists,
        staffLeaveInToday,
        retrySemiTime
      );

      const todayStaffWorkIds = tempStaffWork.map((wl) => wl.staffId);

      const staffAnnualLeaveInToday = staffLeaveInToday
        .filter((staffLeave) => staffLeave.leaveType === "ANNUAL LEAVE")
        .map((staff) => staff.staffId);
      const staffIds = dbStaff.map((staff) => staff.id);
      const staffStopAllCaseIds = lodash.difference(
        staffIds,
        todayStaffWorkIds
      );
      const staffStopIds = staffStopAllCaseIds.filter(
        (staff) => !staffAnnualLeaveInToday.includes(staff)
      );

      showLog &&
        console.log(
          `🍻 ~ ผลลัพธ์::: ${JSON.stringify(tempStaffWork, null, 2)}`
        );
      showLog &&
        console.log(
          `🎁 ~ พนักงานที่ลาหยุดประจำปี ::: ${staffAnnualLeaveInToday}`
        );
      showLog && console.log(`🎁 ~ พนักงานที่ได้หยุด ::: ${staffStopIds}`);
      staffWorkInYesterDay = tempStaffWork;
      staffLeaveYesterDayIds = staffStopAllCaseIds;
      workStaffIds = workStaffIds.filter(
        (staff) => !staffStopAllCaseIds.includes(staff)
      );
      staffNotWorkExceedQuotaIds = staffNotWorkExceedQuotaIds.filter(
        (staff) => !staffStopIds.includes(staff)
      );

      leaveStaffIds = [...leaveStaffIds, ...staffStopIds];
      workStaffIds = [...workStaffIds, ...todayStaffWorkIds];
      staffNotWorkExceedQuotaIds = [
        ...staffNotWorkExceedQuotaIds,
        ...todayStaffWorkIds,
      ];

      // reports
      results.push({
        date: nowDate,
        staffWork: tempStaffWork,
        staffStopIds,
      });

      staffStopIds?.forEach?.((staff) => {
        historyAllStop[staff] = {
          staffId: staff,
          count: (historyAllStop?.[staff]?.count || 0) + 1,
        };
      });
    });

  // !showLog &&
  //   console.log(`🎁 ~ ผลลัพธ์ ::: ${JSON.stringify(results, null, 2)}`);
  return { results, historyAllStop };
};
