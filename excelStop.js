const isDev = require('./isDev');
const { exCludeArea, dbStaff, dbStaffLeave, ex } = isDev ? require('./data') : require('./dataFull');

const writeXlsxFile = require('write-excel-file/node');
const moment = require('moment');
const { getAreaTime, getAreaName } = require('./helper');

module.exports = async (results) => {
  // console.log(`🍻 ~ results:::`, JSON.stringify(results, null, 2));
  if (!results || results?.length === 0) return;

  const objects = exCludeArea.map((_, idx) => {
    const date = moment().startOf('months').add(idx, 'days').format('YYYY-MM-DD');

    const item = dbStaff.map((staff) => {
      const staffData = results.find((r) => r.staffData.id === staff.id);
      const calendarStaff = staffData.calendar.find((c) => c.date === date);
      return {
        [staff.vid]: calendarStaff.isStop ? 'หยุด' : '',
      };
    });
    const result = {};

    Object.entries(item).forEach(([key, value]) => {
      if (key !== 'date') {
        const [innerKey, innerValue] = Object.entries(value)[0];
        result[innerKey] = innerValue;
      }
    });

    return {
      date,
      ...result,
    };
  });

  // console.log(`🍻 ~ objects:::`, objects);

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
      };
    }),
  ];

  await writeXlsxFile(objects, {
    schema,
    // filePath: `file-${Date.now()}.xlsx`,
    filePath: `file-stop.xlsx`,
    orientation: 'landscape',
  });
};
