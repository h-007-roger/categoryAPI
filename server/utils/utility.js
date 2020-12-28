const _ = require('lodash');

const conertDateInServerFormatString = date => {
    return `${date.getFullYear()}-${("0" + (date.getMonth()+1)).slice(-2)}-${("0" + date.getDate()).slice(-2)}`
}

const validateDate = (date) =>
{
    var pattern =/^([0-9]{4})\-([0-9]{2})\-([0-9]{2})$/;
    if (!pattern.test(date)) {
        return false;
    }
    return true
}

const getQuarter = (date) => {
    return 'Q' + Math.ceil((date.getMonth()+ 1)/3) +'-'+date.getFullYear();
  }
  
const listQuarters = (sDate, eDate) => {
  console.log(sDate, eDate)
    // Ensure start is the earlier date;
    if (sDate > eDate) {
      var t = eDate;
      eDate = sDate;
      sDate = t;
    }
  
    // Copy input start date do don't affect original
    sDate = new Date(sDate);
    
    // Set to 2nd of month so adding months doesn't roll over
    // and not affected by daylight saving
    sDate.setDate(2);
  
    // Initialise result array with start quarter
    var startQ = getQuarter(sDate);
    var endQ   = getQuarter(eDate);
    var result = [startQ];
    
    // List quarters from start to end
    while (startQ != endQ) {
      sDate.setMonth(sDate.getMonth() + 3);
      startQ = getQuarter(sDate);
      result.push(startQ);
    } 
    
    return result;
  }

  const getMonthsListBetweenDateRange = (fromDate, toDate) => {
    const fromYear = fromDate.getFullYear();
    const fromMonth = fromDate.getMonth();
    const toYear = toDate.getFullYear();
    const toMonth = toDate.getMonth();
    const months = [];
    for(let year = fromYear; year <= toYear; year++) {
      let month = year === fromYear ? fromMonth : 0;
      const monthLimit = year === toYear ? toMonth : 11;
      for(; month <= monthLimit; month++) {
        months.push({ year, month })
      }
    }
    // 0 is jan & 11 is dec
    return months;
  }

  const getPreviousQuarter = (quarter) => {
    const arr = quarter.split(/[Q,-]+/)
    if(parseInt(arr[1])>1){
        return (`Q${parseInt(arr[1]) - 1}-${arr[2]}`)
    } else {
        return (`Q4-${parseInt(arr[2]) - 1}`)
    }
  }

  const getNextQuarter = (quarter) => {
    const arr = quarter.split(/[Q,-]+/)
    if(parseInt(arr[1]) < 4){
        return (`Q${parseInt(arr[1]) + 1}-${arr[2]}`)
    } else {
        return (`Q1-${parseInt(arr[2]) + 1}`)
    }
  }

  const getAttritionCountPercentage  = (terminationCount = 0, openingCount = 0, closingCount = 0) => {
    const attirationPercentage = terminationCount /(( openingCount + closingCount)/2);
    return parseFloat(attirationPercentage * 100).toFixed(2);
  }

  const getMonthFromDate = (strDate) => {
    const d = new Date(strDate)
    return d.getMonth()+1
  }

  const getMonthName = {
    1: 'Jan',
    2: 'Feb',
    3: 'Mar',
    4: 'Apr',
    5: 'May',
    6: 'Jun',
    7: 'Jul',
    8: 'Aug',
    9: 'Sep',
    10: 'Oct',
    11: 'Nov',
    12: 'Dec',
  }

  const getTabularResponse = (response,parentKey,childKey) => {
    const finalArray = [];
    if(response.length > 0) {
      const arrofParent = response.map(objBand => objBand[parentKey]);
      const uniqueParentArr = arrofParent.filter(function(item, pos) {
        return arrofParent.indexOf(item) == pos;
      })

      const arrofChild = response.map(obj => obj[childKey]);
      const uniqueChildArr = arrofChild.filter(function(item, pos) {
        return arrofChild.indexOf(item) == pos;
      })
      

      for(let i=0; i<uniqueParentArr.length; i++) {
    
        const objOfParentAndChild = {};
        objOfParentAndChild.rowName = uniqueParentArr[i];

        const arrOfSameBand =  response.filter(obj =>obj[parentKey] == uniqueParentArr[i])
        const arrChildWise = [];

        for(let j=0; j<uniqueChildArr.length; j++) {
          const objChild = {};
          const arrOfSpecificBUValue = arrOfSameBand.filter(obj =>obj[childKey] == uniqueChildArr[j])
          if(arrOfSpecificBUValue[0]){
            objChild.value = arrOfSpecificBUValue[0].employee_count;
          }else{
            objChild.value = 0;
          }
          objChild.columnName = uniqueChildArr[j];
          arrChildWise.push(objChild);
        }

        objOfParentAndChild.rowData = arrChildWise;
        finalArray.push(objOfParentAndChild)
      }
    }
    return finalArray;
  }

  const getTabularResponseForExperience = (response,parentKey,childKey) => {
    const finalArray = [];
    if(response.length > 0) {
      const arrofParent = response.map(objBand => objBand[parentKey]);
      const uniqueParentArr = arrofParent.filter(function(item, pos) {
        return arrofParent.indexOf(item) == pos;
      })

      const arrofMax = response.map(objChildYear => objChildYear[childKey]);
      const maxYear = Math.max(...arrofMax);
      

      for(let i=0; i<uniqueParentArr.length; i++) {
    
        const objOfParentAndChild = {};
        objOfParentAndChild.rowName = uniqueParentArr[i];

        const arrOfSameBand =  response.filter(obj =>obj[parentKey] == uniqueParentArr[i])
        const arrChildWise = [];

        for(let j=0; j<=maxYear; j++) {
          const objChild = {};
          const arrOfSpecificBUValue = arrOfSameBand.filter(obj =>obj[childKey] == j)
          if(arrOfSpecificBUValue[0]){
            objChild.value = arrOfSpecificBUValue[0].employee_count;
          }else{
            objChild.value = 0;
          }
          objChild.columnName = j;
          arrChildWise.push(objChild);
        }

        const rowData = _.orderBy(arrChildWise, ['columnName'],['asc']);
        objOfParentAndChild.rowData = rowData;
        finalArray.push(objOfParentAndChild)
      }
    }
    return finalArray;
  }

module.exports = {
    conertDateInServerFormatString,
    validateDate,
    listQuarters,
    getPreviousQuarter,
    getNextQuarter,
    getMonthFromDate,
    getAttritionCountPercentage,
    getMonthsListBetweenDateRange,
    getMonthName,
    getTabularResponse,
    getTabularResponseForExperience,
}