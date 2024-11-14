const {
  dbArea,
  dbAreaOpens,
  exCludeArea,
  dbStaffLeave,
  dbStaffArea,
  dbStaff,
} = require("./data");
const moment = require("moment");
const lodash = require("lodash");

module.exports = () => {
  const showLog = true;
  const nowPeriod = moment().format("YYYY-MM");

  // query database
  let staffLists = [...dbStaff];
  // staffLists = lodash.shuffle(staffLists);
  let resultStop = [];
  Array(1)
    .fill("")
    .forEach((_, days) => {
      const nowDate = moment()
        .startOf("months")
        .add(days, "days")
        .format("YYYY-MM-DD");

      const areaOpenLists = dbAreaOpens.find(
        (areaOpen) => areaOpen.date === nowDate
      ).areaIds;

      console.log(`🍻 ~ พื้นที่ที่เปิด:::`, areaOpenLists);

      const staffLeaveList = dbStaffLeave.filter(
        (staff) => staff.date === nowDate
      );
      const staffListsIds = staffLists.map((staff) => staff.id);
      const staffNotAvailable = staffLeaveList
        .filter((staffLeave) => staffLeave.leaveType === "ANNUAL LEAVE")
        .map((staff) => staff.staffId);

      const staffCanStopLists = lodash.difference(
        staffListsIds,
        staffNotAvailable
      );

      let staffStop = [];
      const staffWorkFourthDays = [];

      showLog && console.log(`🍻 ~ ================================== :::`);
      showLog &&
        console.log(
          `🍻 ~ พนักงานที่ยังไม่ได้ลาหยุดพักร้อน :::`,
          staffCanStopLists
        );
      showLog &&
        console.log(
          `🍻 ~ พนักงานที่ยังไม่ได้ลาหยุดพักร้อน :::`,
          staffCanStopLists
        );

      const areaOpenWithStaff = areaOpenLists.map((areaOpen) => {
        return {
          areaId: areaOpen,
          staffIds: dbStaffArea
            .filter(
              (staffArea) =>
                staffArea.areaId === areaOpen && staffArea.period === nowPeriod
            )
            .map((staff) => staff.staffId),
        };
      });

      let nextAreaWithStaff = lodash.cloneDeep(areaOpenWithStaff);

      staffCanStopLists.forEach((currentStaff) => {
        showLog && console.log(`🍻 ~ ================================== :::`);
        console.log(`🍻 ~ nextAreaWithStaff:::`, nextAreaWithStaff);
        showLog && console.log(`🍻 ~ พนักงานปัจจุบัน :::`, currentStaff);
        showLog && console.log(`🍻 ~ คนที่ได้หยุดไปแล้ว:::`, staffStop);

        const currentStaffWorkInArea = dbStaffArea
          .filter(
            (staffArea) =>
              staffArea.staffId === currentStaff &&
              staffArea.period === nowPeriod
          )
          .map((area) => area.areaId);

        showLog &&
          console.log(
            `🛠️ ~ คนนี้ทำงานพื้นที่ไหนบ้าง:::`,
            currentStaffWorkInArea
          );

        const currentStaffWorkInAreaOpen = currentStaffWorkInArea.some(
          (curStaffWorkInArea) => areaOpenLists.includes(curStaffWorkInArea)
        );
        console.log(
          `🍻 ~ มีพื้นที่ไหนเปิดตรงกับที่พนักงานคนนี้ทำหรือไม่ :::`,
          currentStaffWorkInAreaOpen
        );

        if (!currentStaffWorkInAreaOpen) {
          showLog &&
            console.log(
              `✅ STOP STAFF :: ${currentStaff} :: NOT IN AREA OPEN `
            );
          staffStop.push(currentStaff);
        } else {
          const staffEnough = nextAreaWithStaff.every((area, idx) => {
            const result = nextAreaWithStaff[idx].staffIds.filter(
              (staff) =>
                staff !== currentStaff && //ไม่ใช่ตัวเอง
                staffCanStopLists.includes(staff) && //ต้องเป็นคนที่ยังไม่เคยลา
                !staffStop.includes(staff) //ต้องไม่ใช่พนักงานที่ได้หยุดไปแล้ว
            );
            console.log(`🍻 ~ :: area :: ${area.areaId} ++++++++++`);
            console.log(`🍻 ~ หลังจากตัด  :::`, result);

            if (result.length === 1) {
              if (result[0] === currentStaff) {
                nextAreaWithStaff[idx].staffIds = [currentStaff];
                console.log(
                  `🍻 ~ CASE [1] พนักเป็นคนสุดท้าย :: ${currentStaff} :: พื้นที่ ${area.areaId} :: เหลือ :: ${nextAreaWithStaff[idx].staffIds} :::`
                );
                return false;
              } else {
                console.log(
                  `🍻 ~ ลบพนักงาน :: ${result[0]} :: ออกจากทุกจุด :::`
                );
                nextAreaWithStaff = nextAreaWithStaff.map(
                  ({ areaId, staffIds }) => ({
                    areaId,
                    staffIds: [
                      ...staffIds.filter(
                        (s) => s !== result[0] && s !== currentStaff
                      ),
                    ],
                  })
                );
                nextAreaWithStaff[idx].staffIds = result;
                console.log(
                  `🍻 ~ CASE [2] ล็อกให้พนักงงาน ${result} ได้ทำงาในพื้นที่ที่ :: ${area.areaId} เหลือ :: ${nextAreaWithStaff[idx].staffIds} :::`
                );
                return true;
              }
            } else if (result.length === 0) {
              nextAreaWithStaff[idx].staffIds = [currentStaff];
              console.log(
                `🍻 ~ CASE [3] ไม่เหลือใครเลย :: ${currentStaff} :: พื้นที่ ${area.areaId} :: เหลือ :: ${nextAreaWithStaff[idx].staffIds} :::`
              );
              return false;
            } else {
              nextAreaWithStaff[idx].staffIds = result;
              console.log(
                `🍻 ~ CASE [4] ยังมีพนักงานเหลืออยู่ :: ${currentStaff} :: พื้นที่ ${area.areaId} :: เหลือ :: ${nextAreaWithStaff[idx].staffIds} :::`
              );
            }
            return true;
          });

          if (staffEnough) {
            staffStop.push(currentStaff);
          }

          // const areaValidate = dbStaffArea
          //   .filter(
          //     (staffArea) =>
          //       staffArea.staffId === currentStaff &&
          //       staffArea.period === nowPeriod
          //   )
          //   .map((area) => area.areaId)
          //   .filter((area) => areaOpenLists.includes(area));

          // console.log(
          //   `🍻 ~ พื้นที่ที่เปิดและคนนี้เป็นคนทำงาน :::`,
          //   areaValidate
          // );

          // const staffEnough = areaValidate.every((area) => {
          //   //areaOpenLists
          //   const result = dbStaffArea
          //     .filter(
          //       (staffArea) =>
          //         staffArea.staffId !== currentStaff &&
          //         staffArea.areaId === area &&
          //         staffArea.period === nowPeriod
          //     )
          //     .map((staff) => staff.staffId)
          //     .filter((staff) => staffCanStopLists.includes(staff))
          //     .filter((staff) => !staffStop.includes(staff));

          //   console.log(
          //     `🍻 ~ ในพื้นที่ :: ${area} ::  ${
          //       result.length === 0 ? "ไม่เหลือ" : `เหลือ ${result}`
          //     } :: ที่สามารถทำงานต่อได้:::`
          //   );
          //   return result.length;
          // });
          // if (staffEnough) {
          //   staffStop.push(currentStaff);
          //   showLog &&
          //     console.log(`✅ STOP STAFF :: ${currentStaff} :: STAFF ENOUGH `);
          // } else {
          //   staffWork.push(currentStaff);
          //   showLog &&
          //     console.log(
          //       `❌ CAN NOT STOP STAFF :: ${currentStaff} :: STAFF NOT ENOUGH `
          //     );
          // }
        }
      });

      resultStop.push({ date: nowDate, staffStop });
      console.log("🎁 nextAreaWithStaff", nextAreaWithStaff);
    });

  console.log("🎁 resultStop", resultStop);
};
