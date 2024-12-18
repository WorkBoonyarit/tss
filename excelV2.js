const isDev = require('./isDev');
const { exCludeArea, dbStaff, dbStaffLeave } = isDev ? require('./data') : require('./dataFull');

const writeXlsxFile = require('write-excel-file/node');
const moment = require('moment');
const { getAreaTime, getAreaName } = require('./helper');

module.exports = async (results, stopResult, reportsNotFound) => {
  if (!results || results?.length === 0) return;
  const data = results.flatMap((a) =>
    a.staffWork.map((b) => {
      return {
        date: a.date,
        staffId: b.staffId,
        areaId: b.areaId,
      };
    })
  );

  const objects = exCludeArea.map((_, idx) => {
    const date = moment().startOf('months').add(idx, 'days').format('YYYY-MM-DD');

    const reportToDate = reportsNotFound.filter((r) => r.nowDate === date);

    const staffCanWorkInArea = reportToDate.map((report) => JSON.stringify(report, null, 2)).toString();

    const item = dbStaff.map((staff) => {
      const areaId = data.find((s) => s.date === date && s.staffId === staff.id)?.areaId || null;

      const isAnnualLeave = dbStaffLeave.find((staffLeave) => staffLeave.date === date && staffLeave.staffId === staff.id && staffLeave.leaveType === 'ANNUAL LEAVE');

      const isAutoStop = stopResult.find((stop) => stop.staffData.vid === staff.vid)?.calendar?.filter((c) => c.isStop && c.date === date).length > 0;

      return {
        [staff.vid]: areaId ? `(${areaId}) ${getAreaName?.(areaId)} :: [${getAreaTime?.(areaId)}]` : isAutoStop ? 'AUTO STOP' : isAnnualLeave ? 'ลาหยุด' : '',
      };
    });
    const result = {};

    Object.entries(item).forEach(([key, value]) => {
      if (!['date', 'areaNoStaff', 'staffCanWorkInArea'].includes(key)) {
        const [innerKey, innerValue] = Object.entries(value)[0];
        result[innerKey] = innerValue;
      }
    });
    return {
      date,
      ...result,
      staffCanWorkInArea,
    };
  });

  const schema = [
    {
      column: '',
      type: String,
      value: (data) => data.date,
    },
    ...dbStaff.map((staff) => {
      return {
        column: staff.vid,
        type: String,
        value: (data) => data?.[staff.vid],
        width: 30,
      };
    }),
    // {
    //   column: 'Candidate',
    //   type: String,
    //   value: (data) => data.staffCanWorkInArea,
    // },
  ];

  await writeXlsxFile(objects, {
    schema,
    // filePath: `file-${Date.now()}.xlsx`,
    filePath: `file.xlsx`,
  });
};
