const { dbStaffArea, dbAreaOpens, dbStaffLeave, dbArea } = require("./data");
const moment = require("moment");

module.exports = () => {
  const bodyReq = {
    staffId: "4",
    staffVid: "5215",
    leaveDate: "2024-11-03",
    leaveTime: ["09:00", "12:00"],
    leaveType: "MEETING",
  };

  //query database query staff ที่ลาในวันนั้น
  const staffLeaveList = dbStaffLeave.filter(
    (staff) => staff.date === bodyReq.leaveDate
  );

  const yourAnnualLeave = staffLeaveList.find(
    (staff) =>
      staff.staffId === bodyReq.staffId && staff.leaveType === "ANNUAL LEAVE"
  );
  if (yourAnnualLeave) {
    throw new Error("CAN NOT LEAVE");
  }

  //staff สามารถทำพื้นที่ไหนได้บ้าง
  const periodLeave = moment(bodyReq.leaveDate).format("YYYY-MM");
  //query database where ด้วย period เดือนนั้นๆ
  const staffInPeriod = dbStaffArea.find((area) => area.period === periodLeave);
  const staffCanWorkInArea = staffInPeriod.staffArea.find(
    (staff) => staff.staffId === bodyReq.staffId
  );

  //เช็คต่อว่า พื้นที่นั้น เปิดหรือไม่ในวันที่ลา
  //query database where พื้นที่ที่ตรงกับวันที่ลา
  const areaOpenLists = dbAreaOpens.find(
    (area) => area.date === bodyReq.leaveDate
  );

  //staff คนที่ลา ตรงพื้นที่ ที่เปิดในวันนี้ ไหนบ้าง ?
  const areaValidate = areaOpenLists.areaIds.filter((areaOpen) =>
    staffCanWorkInArea.areaWork.includes(areaOpen)
  );

  if (areaValidate.length > 0) {
    //ถ้ามีให้ทำเช็คต่อ

    //staff คนไหนบ้างที่ทำในพื้นที่นี้ และมีคนพอหรือไม่
    let staffInAreaValidate = [];

    areaValidate.forEach((area) => {
      const { areaTime } = dbArea.find((areaData) => areaData.id === area);
      const staffArea = staffInPeriod.staffArea
        .filter(
          (staff) =>
            staff.areaWork.includes(area) && //เป็น staff ที่อยู่ในพื้นที่
            staff.staffId !== bodyReq.staffId && //ต้องไม่ใช่ตัวเอง
            !staffLeaveList.some((staffLeave) => {
              return (
                staffLeave.staffId === staff.staffId && //เป็น staff ที่อยู่ใน period
                (staffLeave.leaveType === "ANNUAL LEAVE" || //ต้องไม่ใช่ลาพักร้อน
                  (staffLeave.leaveType === "MEETING" && //ถ้าเป็น meeting ต้องไม่อยู่ในช่วงเวลา
                    staffLeave.leaveTime[1] > areaTime[0] &&
                    staffLeave.leaveTime[0] < areaTime[1]) ||
                  (staffLeave.leaveTime[0] === areaTime[0] &&
                    staffLeave.leaveTime[1] === areaTime[1]))
              );
            }) //ต้องไม่เป็น staff ที่ลา
        )
        .map((staff) => staff.staffId);

      if (staffArea.length === 0) {
        throw new Error(`CAN NOT LEAVE :: STAFF NOT ENOUGH AREA (${area}) `);
      }
      staffInAreaValidate.push({
        areaId: area,
        staffInArea: staffArea,
      });
    });
    console.log(
      "🚀 ~ areaValidate.forEach ~ staffInAreaValidate:",
      staffInAreaValidate
    );

    console.log("CAN LEAVE");
  } else {
    //สามารถลาได้เลย
    console.log("CAN LEAVE");
  }
};
