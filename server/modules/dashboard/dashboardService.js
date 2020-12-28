var express = require('express'),
    router = express.Router();
const url = require('url');
const querystring = require('querystring');
const {
    send200,
    send400,
    send401,
    send403
} = require('../../utils/response');
const {
  getUserData,
  getLocationWiseUserCount,
  getBandWiseEmpCount,
  getStatusWiseEmpCount,
  getCountryWiseHeadCount,
  getEmpDetailWithLocation,
  getEmpLocList,
  getEmploymentStatus,
  getEmpGroupList,
  getEmpBandList,
  getStatusAndCountryWiseEmpCount,
  getPreviousQuarterStartAndEndDate,
  getQuarterWiseLocEmpCount,
  getEmpCountForLocationBeforeSpecificDate,
  getQuarterWiseBUEmpCount,
  getEmpCountForBUBeforeSpecificDate,
  getQuarterWiseTotalEmpCount,
  getEmpCountBeforeSpecificDate,
  getBandAndLocWiseEmpCount,
  queryToDetectTerminatedEmployeesTillToday,
  queryToDetectOpeningAndClosingHeadCount,
  getTerminatedVoluntaryEmpTillToday,
  getTerminatedRegularEmpTillToday,
  getBandWiseAttrition,
  getStatusWiseAttrition,
  getBUWiseEmpAttrition,
  getIcplExpWiseAttrition,
  queryToDetectTerminatedEmployeesBetweenStartAndEndDate,
  getHeadCountWithBUAndBand,
  getHeadCountWithExperienceAndBand,
  getHeadCountWithTotalExperienceAndBand,
  getIcplExpVsBuWiseCount,
  getTotalExpVsBuWiseCount,
  getReasonWiseEmpTerminatedCount,
} = require('../../db/sql-coonection');
const {
  conertDateInServerFormatString,
  validateDate,
  listQuarters,
  getPreviousQuarter,
  getNextQuarter,
  getAttritionCountPercentage,
  getMonthsListBetweenDateRange,
  getMonthName,
  getTabularResponse,
  getTabularResponseForExperience
} = require('../../utils/utility');
const _ = require('lodash');

// var automatedRoutes = require('./testRoutes/automated');

router
  // Add a binding to handle '/tests'
  .get('/getUserData', (req, resp) => {
    getUserData().then(response => {
        send200(resp,response)
    }).catch(err => {
        send400(resp,err);
    })
  })

router.get('/getLocWiseEmpCount', (req, resp) => {
  getLocationWiseUserCount().then(response => {
        send200(resp,response)
    }).catch(err => {
        send400(resp,err);
    })
  })

router.get('/getBandWiseEmpCount', (req, resp) => {
  let parsedUrl = url.parse(req.url);
  let parsedQs = querystring.parse(parsedUrl.query);
  let bandIds = parsedQs.bandIds || '';
  getBandWiseEmpCount(bandIds).then(response => {
        send200(resp,response)
    }).catch(err => {
        send400(resp,err);
    })
  })

router.get('/getBandAndLocWiseEmpCount', (req, resp) => {
  let parsedUrl = url.parse(req.url);
  let parsedQs = querystring.parse(parsedUrl.query);
  let bandIds = parsedQs.bandIds || '';
  let locationIds = parsedQs.locationIds || '';
  getBandAndLocWiseEmpCount(bandIds,locationIds).then(response => {
        const finalArray = [];
        if(response.length > 0) {
          const arrofBand = response.map(objBand => objBand.band);
          const uniqueBandArr = arrofBand.filter(function(item, pos) {
            return arrofBand.indexOf(item) == pos;
          })
          
          for(let i=0; i<uniqueBandArr.length; i++) {
            const arrOfSameBand =  response.filter(obj =>obj.band == uniqueBandArr[i])
            
            const objForBand = {}
            arrOfSameBand.forEach((obj) => {
              objForBand.name = obj.band;
              objForBand[obj.city] = obj.employee_count;
            })
            finalArray.push(objForBand)
          }
        }
        send200(resp,finalArray)
    }).catch(err => {
        send400(resp,err);
    })
  })

router.get('/getStatusWiseEmpCount', (req, resp) => {
  getStatusWiseEmpCount().then(response => {
        send200(resp,response)
    }).catch(err => {
        send400(resp,err);
    })
  })

  router.get('/getCountryWiseEmpCount', (req, resp) => {
    getCountryWiseHeadCount().then(response => {
          let totalEmp = 0, totalFemaleEmp = 0;
          response.forEach(element => {
            totalEmp = totalEmp + element.employee_count;
            totalFemaleEmp = totalFemaleEmp + element.female;
          }); 
          const femaleInPercentage = parseFloat(`${(totalFemaleEmp/totalEmp * 100)}`).toFixed(2);
          send200(resp,{
            list: response,
            totalEmp,
            totalFemaleEmp,
            femaleInPercentage,
          })
      }).catch(err => {
          send400(resp,err);
      })
    })

  router.get('/getEmpStatus', (req, resp) => {
    getEmploymentStatus().then(response => {
          send200(resp,response)
      }).catch(err => {
          send400(resp,err);
      })
    })

router.get('/getEmpLocList', (req, resp) => {
      getEmpLocList().then(response => {
            send200(resp,response)
        }).catch(err => {
            send400(resp,err);
        })
      })

router.get('/getEmpGroupList', (req, resp) => {
  getEmpGroupList().then(response => {
         send200(resp,response)
    }).catch(err => {
        send400(resp,err);
    })
  })

router.get('/getEmpBandList', (req, resp) => {
    getEmpBandList().then(response => {
           const arrOfBand = response.map(obj => obj.band)
           send200(resp,arrOfBand)
      }).catch(err => {
          send400(resp,err);
      })
  })

  router.get('/getStatusAndCountryWiseEmpCount', (req, resp) => {
    let parsedUrl = url.parse(req.url);
    let parsedQs = querystring.parse(parsedUrl.query);
    let statusIds = parsedQs.statusIds || '';
    getStatusAndCountryWiseEmpCount(statusIds).then(response => {
            let objStatus = {};
           _.forEach(response, (obj) => {
            let arrOfCountryStatus = objStatus[obj.country] || [];
             arrOfCountryStatus.push({
               title: obj.status_title,
               status_id: obj.emp_status_id,
               employee_count: obj.employee_count,
               female: obj.female,
             })
             objStatus[obj.country] = arrOfCountryStatus;
           })
           send200(resp,objStatus)
      }).catch(err => {
          send400(resp,err);
      })
  })

  router.get('/getQuarterWiseLocEmpCount', (req, resp) => {
    let parsedUrl = url.parse(req.url);
    let parsedQs = querystring.parse(parsedUrl.query);
    let startDate = parsedQs.startDate;
    let endDate = parsedQs.endDate;
    let locationIds = parsedQs.locationIds || '';
    // let arrOfLocationIds = [];
    // arrOfLocationIds = locationIds.split(',');

    
    if(startDate && !validateDate(startDate)){
        send403(resp,{
          message: "Start date is in invalid format.",
        })
        return
    }
    if(!endDate){
      endDate = conertDateInServerFormatString(new Date())
    } else {
      if(!validateDate(endDate)){
        send403(resp,{
          message: "End date is in invalid format.",
        })
        return
      }
    }
    
      getPreviousQuarterStartAndEndDate((!startDate) ? 3 : 0).then(respDate => {
        if(respDate) {
          startDate = conertDateInServerFormatString(respDate[0].quaStartDate)
        }
        getEmpCountForLocationBeforeSpecificDate(startDate,locationIds).then(respBeforeStartDate => {
          const objBeforeStartDate = {};
          _.forEach(respBeforeStartDate, (objData) => {
              objBeforeStartDate[objData.country] = {
                ...objBeforeStartDate[objData.country],
                [objData.city]: objData.emp_count,
              }
          })
          getQuarterWiseLocEmpCount(startDate,endDate,locationIds).then(response => {
            let objLocation = {};
          
          var joinedEmpCount = 0;
          var terminatedEmpCount = 0;
          const listOfQuarter = listQuarters(new Date(startDate),new Date(endDate));
          for (let i=0; i<response.length; i ++){
            let obj = response[i];
            let objCity = objLocation[obj.country] || {};
            let arrOfJoiningEmp = objCity[obj.city] || [];

            joinedEmpCount = (arrOfJoiningEmp.length > 0) ? joinedEmpCount : objBeforeStartDate[obj.country][obj.city];

            // previous quarter data check
            let prevQuarter = getPreviousQuarter(`Q${obj.quarter}-${obj.year}`);
            let indexPrevQuarter = listOfQuarter.findIndex(objPrev => objPrev === prevQuarter);

            while(indexPrevQuarter !== -1 && arrOfJoiningEmp[arrOfJoiningEmp.length - 1].quarter !== prevQuarter){
                arrOfJoiningEmp.splice(0,0,{
                  quarter: prevQuarter,
                  employee_count: joinedEmpCount,
                })
                prevQuarter = getPreviousQuarter(prevQuarter);
                indexPrevQuarter = listOfQuarter.findIndex(objPrev => objPrev === prevQuarter);
            }

            // current quarter data check
            terminatedEmpCount = (obj.terminated_emp_count) ? obj.terminated_emp_count : 0;
            joinedEmpCount = joinedEmpCount - terminatedEmpCount + ((obj.joined_emp_count) ? obj.joined_emp_count : 0);

            arrOfJoiningEmp.push({
              quarter: `Q${obj.quarter}-${obj.year}`,
              employee_count: joinedEmpCount,
            })

            // next quarter data check
            let nextQuarter = getNextQuarter(`Q${obj.quarter}-${obj.year}`);
            let indexNextQuarter = listOfQuarter.findIndex(objNext => objNext == nextQuarter)

            if(indexNextQuarter !== -1){
              // joinedEmpCount = joinedEmpCount - terminatedEmpCount;
              //   terminatedEmpCount = 0;
              if(i<(response.length - 1)){
                const nextObj = response[i+1];
                while(indexNextQuarter !== -1) {
                  if(nextObj.city === obj.city && `Q${nextObj.quarter}-${nextObj.year}` === nextQuarter){
                    indexNextQuarter = -1
                  } else {
                    arrOfJoiningEmp.push({
                      quarter: nextQuarter,
                      employee_count: joinedEmpCount,
                    })
                    nextQuarter = getNextQuarter(nextQuarter);
                    indexNextQuarter = listOfQuarter.findIndex(objNext => objNext == nextQuarter)
                  }
                }
              } else {
                while(indexNextQuarter !== -1) {
                  arrOfJoiningEmp.push({
                    quarter: nextQuarter,
                    employee_count: joinedEmpCount,
                  })
                  nextQuarter = getNextQuarter(nextQuarter);
                  indexNextQuarter = listOfQuarter.findIndex(objNext => objNext == nextQuarter)
                }
              }
            }
            objCity[obj.city] = arrOfJoiningEmp;
            objLocation[obj.country] = objCity;
          }

          // covert to array format
          var arrOfValues = [];
          const arrOfCountryKeys = Object.keys(objLocation);
          arrOfCountryKeys.forEach(elementLocation => {
            const arrOfCityKeys = Object.keys(objLocation[elementLocation]);
            arrOfCityKeys.forEach(elementCities => {
              const arrOfCities = objLocation[elementLocation][elementCities];
              arrOfCities.forEach(elementCityValue => {
                arrOfValues.push({
                  ...elementCityValue,
                  city: elementCities,
                  country: elementLocation,
                })
              })
            })

          });
          send200(resp,arrOfValues)
          }).catch(err => {
             send400(resp,err);
          })
        }).catch(err => {
          send400(resp,err);
       })
      }).catch(err => {
        send400(resp,err);
    })
  })

  router.get('/getQuarterWiseBUEmpCount', (req, resp) => {
    let parsedUrl = url.parse(req.url);
    let parsedQs = querystring.parse(parsedUrl.query);
    let startDate = parsedQs.startDate;
    let endDate = parsedQs.endDate;
    let groupIds = parsedQs.groupIds || '';

    if(startDate && !validateDate(startDate)){
        send403(resp,{
          message: "Start date is in invalid format.",
        })
        return
    }
    if(!endDate){
      endDate = conertDateInServerFormatString(new Date())
    } else {
      if(!validateDate(endDate)){
        send403(resp,{
          message: "End date is in invalid format.",
        })
        return
      }
    }
    
      getPreviousQuarterStartAndEndDate((!startDate) ? 3 : 0).then(respDate => {
        if(respDate) {
          startDate = conertDateInServerFormatString(respDate[0].quaStartDate)
        }

        getEmpCountForBUBeforeSpecificDate(startDate,groupIds).then(respBeforeStartDate => {
          const objBeforeStartDate = {};
          _.forEach(respBeforeStartDate, (objData) => {
              objBeforeStartDate[objData.bu_id] = objData.emp_count
          })

        getQuarterWiseBUEmpCount(startDate,endDate,groupIds).then(response => {
          let objBu = {};
          
          var joinedEmpCount = 0;
          var terminatedEmpCount = 0;
          
          const listOfQuarter = listQuarters(new Date(startDate),new Date(endDate));
          for (let i=0; i<response.length; i ++){
            let obj = response[i];
            let arrOfJoiningEmp = objBu[obj.bu_id] || [];

            joinedEmpCount = (arrOfJoiningEmp.length > 0) ? joinedEmpCount : (objBeforeStartDate[obj.bu_id] ? objBeforeStartDate[obj.bu_id] : 0);

            // previous quarter data check
            let prevQuarter = getPreviousQuarter(`Q${obj.quarter}-${obj.year}`);
            let indexPrevQuarter = listOfQuarter.findIndex(objPrev => objPrev === prevQuarter);

            while(indexPrevQuarter !== -1){
              if((arrOfJoiningEmp.length > 0 && arrOfJoiningEmp.findIndex(objt => objt.quarter === prevQuarter) === -1) || arrOfJoiningEmp.length === 0){
                arrOfJoiningEmp.splice(0,0,{
                    quarter: prevQuarter,
                    employee_count: joinedEmpCount,
                    bu_name: obj.bu_name,
                  })
              } 
              prevQuarter = getPreviousQuarter(prevQuarter);
              indexPrevQuarter = listOfQuarter.findIndex(objPrev => objPrev === prevQuarter);
            }

            terminatedEmpCount = (obj.terminated_emp_count) ? obj.terminated_emp_count : 0;
            joinedEmpCount = joinedEmpCount - terminatedEmpCount + ((obj.joined_emp_count) ? obj.joined_emp_count : 0);
            

            // current quarter data check
            arrOfJoiningEmp.push({
              quarter: `Q${obj.quarter}-${obj.year}`,
              employee_count: joinedEmpCount,
              bu_name: obj.bu_name,
            })

            // next quarter data check
            let nextQuarter = getNextQuarter(`Q${obj.quarter}-${obj.year}`);
            let indexNextQuarter = listOfQuarter.findIndex(objNext => objNext == nextQuarter)

            if(indexNextQuarter !== -1){
              // joinedEmpCount = joinedEmpCount - terminatedEmpCount;
              // terminatedEmpCount = 0;
              if(i<(response.length - 1)){
                const nextObj = response[i+1];
                while(indexNextQuarter !== -1) {
                  if(nextObj.bu_id === obj.bu_id && `Q${nextObj.quarter}-${nextObj.year}` === nextQuarter){
                    indexNextQuarter = -1
                  } else {
                    arrOfJoiningEmp.push({
                      quarter: nextQuarter,
                      employee_count: joinedEmpCount,
                      bu_name: obj.bu_name,
                    })
                    
                    nextQuarter = getNextQuarter(nextQuarter);
                    indexNextQuarter = listOfQuarter.findIndex(objNext => objNext == nextQuarter)
                  }
                }
              } else {
                while(indexNextQuarter !== -1) {
                  arrOfJoiningEmp.push({
                    quarter: nextQuarter,
                    employee_count: joinedEmpCount,
                    bu_name: obj.bu_name,
                  })
                  
                  nextQuarter = getNextQuarter(nextQuarter);
                  indexNextQuarter = listOfQuarter.findIndex(objNext => objNext == nextQuarter)
                }
              }
            }
            objBu[obj.bu_id] = arrOfJoiningEmp;
          }

          var arrOfValues = [];
          const arrOfBUKeys = Object.keys(objBu);
          arrOfBUKeys.forEach(elementBU => {
              const arrOfBU = objBu[elementBU];
              arrOfBU.forEach(elementBUValue => {
                arrOfValues.push({
                  ...elementBUValue,
                  bu_id: elementBU,
                  bu_name: elementBUValue.bu_name,
                })
            })
          });

          send200(resp,arrOfValues)
          }).catch(err => {
             send400(resp,err);
          })
        }).catch(err => {
          send400(resp,err);
       })
      }).catch(err => {
        send400(resp,err);
    })
  })

  router.get('/getQuarterWiseEmpCount', (req, resp) => {
    let parsedUrl = url.parse(req.url);
    let parsedQs = querystring.parse(parsedUrl.query);
    let startDate = parsedQs.startDate;
    let endDate = parsedQs.endDate;

    if(startDate && !validateDate(startDate)){
        send403(resp,{
          message: "Start date is in invalid format.",
        })
        return
    }
    if(!endDate){
      endDate = conertDateInServerFormatString(new Date())
    } else {
      if(!validateDate(endDate)){
        send403(resp,{
          message: "End date is in invalid format.",
        })
        return
      }
    }
    
      getPreviousQuarterStartAndEndDate((!startDate) ? 3 : 0).then(respDate => {
        if(respDate) {
          startDate = conertDateInServerFormatString(respDate[0].quaStartDate)
        }
        getEmpCountBeforeSpecificDate(startDate).then(respBeforeStartDate => {
          
          const empCountBeforeStartDate = respBeforeStartDate[0].emp_count || 0;
         
          getQuarterWiseTotalEmpCount(startDate,endDate).then(response => {
            
            var arrOfValues = [];

            var joinedEmpCount = empCountBeforeStartDate;
            var terminatedEmpCount = 0;
            const listOfQuarter = listQuarters(new Date(startDate),new Date(endDate));
            for (let i=0; i<response.length; i ++){
              let obj = response[i];

            // previous quarter data check
            let prevQuarter = getPreviousQuarter(`Q${obj.quarter}-${obj.year}`);
            let indexPrevQuarter = listOfQuarter.findIndex(objPrev => objPrev === prevQuarter);

            while(indexPrevQuarter !== -1 && arrOfValues[arrOfValues.length - 1].quarter !== prevQuarter){
                arrOfValues.splice(0,0,{
                  quarter: prevQuarter,
                  employee_count: joinedEmpCount,
                })
                prevQuarter = getPreviousQuarter(prevQuarter);
                indexPrevQuarter = listOfQuarter.findIndex(objPrev => objPrev === prevQuarter);
            }

            // current quarter data check
            terminatedEmpCount = (obj.terminated_emp_count) ? obj.terminated_emp_count : 0;
            joinedEmpCount = joinedEmpCount - terminatedEmpCount + ((obj.joined_emp_count) ? obj.joined_emp_count : 0);

            arrOfValues.push({
              quarter: `Q${obj.quarter}-${obj.year}`,
              employee_count: joinedEmpCount,
            })

            // next quarter data check
            let nextQuarter = getNextQuarter(`Q${obj.quarter}-${obj.year}`);
            let indexNextQuarter = listOfQuarter.findIndex(objNext => objNext == nextQuarter)

            if(indexNextQuarter !== -1){
              // joinedEmpCount = joinedEmpCount - terminatedEmpCount;
              //   terminatedEmpCount = 0;
              if(i<(response.length - 1)){
                const nextObj = response[i+1];
                while(indexNextQuarter !== -1 && `Q${nextObj.quarter}-${nextObj.year}` !== nextQuarter) {
                  arrOfValues.push({
                    quarter: nextQuarter,
                    employee_count: joinedEmpCount,
                  })
                  nextQuarter = getNextQuarter(nextQuarter);
                  indexNextQuarter = listOfQuarter.findIndex(objNext => objNext == nextQuarter)
                }
              } else {
                while(indexNextQuarter !== -1) {
                  arrOfValues.push({
                    quarter: nextQuarter,
                    employee_count: joinedEmpCount,
                  })
                  nextQuarter = getNextQuarter(nextQuarter);
                  indexNextQuarter = listOfQuarter.findIndex(objNext => objNext == nextQuarter)
                }
              }
            }
          }
          send200(resp,arrOfValues)
          }).catch(err => {
             send400(resp,err);
          })
        }).catch(err => {
          send400(resp,err);
       })
      }).catch(err => {
        send400(resp,err);
    })
  })

  router.get('/getAttritionPercentage', (req, resp) => {
    let parsedUrl = url.parse(req.url);
    let parsedQs = querystring.parse(parsedUrl.query);
    let startDate = parsedQs.startDate;
    let endDate = parsedQs.endDate;

    if(startDate && !validateDate(startDate)){
        send403(resp,{
          message: "Start date is in invalid format.",
        })
        return
    }
    if(!endDate){
      endDate = conertDateInServerFormatString(new Date())
    } else {
      if(!validateDate(endDate)){
        send403(resp,{
          message: "End date is in invalid format.",
        })
        return
      }
    }
    
      getPreviousQuarterStartAndEndDate((!startDate) ? 3 : 0).then(respDate => {
        if(respDate) {
          startDate = conertDateInServerFormatString(respDate[0].quaStartDate)
        }
        queryToDetectTerminatedEmployeesTillToday().then(respTerminationCount => {
          const empTerminationCount = {
            total: respTerminationCount[0].total_terminated_count || 0,
            ahmedabad: respTerminationCount[0].ahmedabad_terminated_count || 0,
            pune: respTerminationCount[0].pune_terminated_count || 0,
            india: respTerminationCount[0].india_terminated_count || 0,
            usa: respTerminationCount[0].usa_terminated_count || 0,
          };
         
          queryToDetectOpeningAndClosingHeadCount(startDate,endDate).then(response => {
            const finalObjectForAttrition = {};
            
            //total
            finalObjectForAttrition.total = getAttritionCountPercentage(
              empTerminationCount.total,
              response[0].total_opening_count || 0,
              response[1].total_opening_count || 0
            )

            //ahmedabad
            finalObjectForAttrition.ahmedabad = getAttritionCountPercentage(
              empTerminationCount.ahmedabad,
              response[0].ahmedabad_opening_count || 0,
              response[1].ahmedabad_opening_count || 0
            )

            //pune
            finalObjectForAttrition.pune = getAttritionCountPercentage(
              empTerminationCount.pune,
              response[0].pune_opening_count || 0,
              response[1].pune_opening_count || 0
            )

            //india
            finalObjectForAttrition.india = getAttritionCountPercentage(
              empTerminationCount.india,
              response[0].india_opening_count || 0,
              response[1].india_opening_count || 0
            )

            //usa
            finalObjectForAttrition.usa = getAttritionCountPercentage(
              empTerminationCount.usa,
              response[0].usa_opening_count || 0,
              response[1].usa_opening_count || 0
            )
            
            send200(resp,{
              overall_attrition: finalObjectForAttrition,
            })
          }).catch(err => {
             send400(resp,err);
          })
        }).catch(err => {
          send400(resp,err);
       })
      }).catch(err => {
        send400(resp,err);
    })
  })
  
  router.get('/getMonthWiseTerminationEmpCount', (req, resp) => {
    let parsedUrl = url.parse(req.url);
    let parsedQs = querystring.parse(parsedUrl.query);
    let startDate = parsedQs.startDate;
    let endDate = parsedQs.endDate;

    if(startDate && !validateDate(startDate)){
        send403(resp,{
          message: "Start date is in invalid format.",
        })
        return
    }
    if(!endDate){
      endDate = conertDateInServerFormatString(new Date())
    } else {
      if(!validateDate(endDate)){
        send403(resp,{
          message: "End date is in invalid format.",
        })
        return
      }
    }
    
      getPreviousQuarterStartAndEndDate((!startDate) ? 3 : 0).then(respDate => {
        if(respDate) {
          startDate = conertDateInServerFormatString(respDate[0].quaStartDate)
        }
        queryToDetectTerminatedEmployeesBetweenStartAndEndDate(startDate,endDate).then(response => {

          const arrOfResponse = [];
          const listOfMonthsAndYears = getMonthsListBetweenDateRange(new Date(startDate),new Date(endDate));
          for (let i=0; i<listOfMonthsAndYears.length; i ++){
              let obj = listOfMonthsAndYears[i];
              let finalObject = {};
              let objFromResponse = response.filter((item) => {
                return item.month === (obj.month+1) && item.year === obj.year;
              })
              if(objFromResponse[0]){
                finalObject.percentage_alt = objFromResponse[0].percentage_alt;
                finalObject.vol_percentage_alt = objFromResponse[0].vol_percentage_alt;
              }else{
                finalObject.percentage_alt = 0;
                finalObject.vol_percentage_alt = 0;
              }
              finalObject.month = obj.month+1;
              finalObject.name = getMonthName[obj.month+1]
              finalObject.year = obj.year;
              arrOfResponse.push(finalObject);
          }
          send200(resp,arrOfResponse)
          }).catch(err => {
             send400(resp,err);
          })
      }).catch(err => {
        send400(resp,err);
    })
  })

  router.get('/getRegularEmpAttritionPercentage', (req, resp) => {
    let parsedUrl = url.parse(req.url);
    let parsedQs = querystring.parse(parsedUrl.query);
    let startDate = parsedQs.startDate;
    let endDate = parsedQs.endDate;

    if(startDate && !validateDate(startDate)){
        send403(resp,{
          message: "Start date is in invalid format.",
        })
        return
    }
    if(!endDate){
      endDate = conertDateInServerFormatString(new Date())
    } else {
      if(!validateDate(endDate)){
        send403(resp,{
          message: "End date is in invalid format.",
        })
        return
      }
    }
    
      getPreviousQuarterStartAndEndDate((!startDate) ? 3 : 0).then(respDate => {
        if(respDate) {
          startDate = conertDateInServerFormatString(respDate[0].quaStartDate)
        }
        getTerminatedRegularEmpTillToday().then(respTerminationCount => {
          const empTerminationCount = {
            total: respTerminationCount[0].total_terminated_count || 0,
            ahmedabad: respTerminationCount[0].ahmedabad_terminated_count || 0,
            pune: respTerminationCount[0].pune_terminated_count || 0,
            india: respTerminationCount[0].india_terminated_count || 0,
            usa: respTerminationCount[0].usa_terminated_count || 0,
          };
         
          queryToDetectOpeningAndClosingHeadCount(startDate,endDate).then(response => {
            const finalObjectForAttrition = {};
            
            //total
            finalObjectForAttrition.total = getAttritionCountPercentage(
              empTerminationCount.total,
              response[0].total_opening_count || 0,
              response[1].total_opening_count || 0
            )

            //ahmedabad
            finalObjectForAttrition.ahmedabad = getAttritionCountPercentage(
              empTerminationCount.ahmedabad,
              response[0].ahmedabad_opening_count || 0,
              response[1].ahmedabad_opening_count || 0
            )

            //pune
            finalObjectForAttrition.pune = getAttritionCountPercentage(
              empTerminationCount.pune,
              response[0].pune_opening_count || 0,
              response[1].pune_opening_count || 0
            )

            //india
            finalObjectForAttrition.india = getAttritionCountPercentage(
              empTerminationCount.india,
              response[0].india_opening_count || 0,
              response[1].india_opening_count || 0
            )

            //usa
            finalObjectForAttrition.usa = getAttritionCountPercentage(
              empTerminationCount.usa,
              response[0].usa_opening_count || 0,
              response[1].usa_opening_count || 0
            )
            
            send200(resp,{
              regular_emp_attrition : finalObjectForAttrition,
            })
          }).catch(err => {
             send400(resp,err);
          })
        }).catch(err => {
          send400(resp,err);
       })
      }).catch(err => {
        send400(resp,err);
    })
  })
  router.get('/getVoluntaryEmpAttritionPercentage', (req, resp) => {
    let parsedUrl = url.parse(req.url);
    let parsedQs = querystring.parse(parsedUrl.query);
    let startDate = parsedQs.startDate;
    let endDate = parsedQs.endDate;

    if(startDate && !validateDate(startDate)){
        send403(resp,{
          message: "Start date is in invalid format.",
        })
        return
    }
    if(!endDate){
      endDate = conertDateInServerFormatString(new Date())
    } else {
      if(!validateDate(endDate)){
        send403(resp,{
          message: "End date is in invalid format.",
        })
        return
      }
    }
    
  getPreviousQuarterStartAndEndDate((!startDate) ? 3 : 0).then(respDate => {
    if(respDate) {
      startDate = conertDateInServerFormatString(respDate[0].quaStartDate)
    }
    getTerminatedVoluntaryEmpTillToday().then(respTerminationCount => {
      const empTerminationCount = {
        total: respTerminationCount[0].total_terminated_count || 0,
        ahmedabad: respTerminationCount[0].ahmedabad_terminated_count || 0,
        pune: respTerminationCount[0].pune_terminated_count || 0,
        india: respTerminationCount[0].india_terminated_count || 0,
        usa: respTerminationCount[0].usa_terminated_count || 0,
      };
      
      queryToDetectOpeningAndClosingHeadCount(startDate,endDate).then(response => {
        const finalObjectForAttrition = {};
        
        //total
        finalObjectForAttrition.total = getAttritionCountPercentage(
          empTerminationCount.total,
          response[0].total_opening_count || 0,
          response[1].total_opening_count || 0
        )

        //ahmedabad
        finalObjectForAttrition.ahmedabad = getAttritionCountPercentage(
          empTerminationCount.ahmedabad,
          response[0].ahmedabad_opening_count || 0,
          response[1].ahmedabad_opening_count || 0
        )

        //pune
        finalObjectForAttrition.pune = getAttritionCountPercentage(
          empTerminationCount.pune,
          response[0].pune_opening_count || 0,
          response[1].pune_opening_count || 0
        )

        //india
        finalObjectForAttrition.india = getAttritionCountPercentage(
          empTerminationCount.india,
          response[0].india_opening_count || 0,
          response[1].india_opening_count || 0
        )

        //usa
        finalObjectForAttrition.usa = getAttritionCountPercentage(
          empTerminationCount.usa,
          response[0].usa_opening_count || 0,
          response[1].usa_opening_count || 0
        )
        
        send200(resp,{
          voluntary_emp_attrition: finalObjectForAttrition,
        })
      }).catch(err => {
          send400(resp,err);
      })
    }).catch(err => {
      send400(resp,err);
    })
  }).catch(err => {
    send400(resp,err);
  }) 
})

router.get('/getBandWiseEmpAttrition', (req, resp) => {
  let parsedUrl = url.parse(req.url);
  let parsedQs = querystring.parse(parsedUrl.query);
  let bandIds = parsedQs.bandIds || '';
  getBandWiseAttrition(bandIds).then(response => {
        send200(resp,response)
    }).catch(err => {
        send400(resp,err);
    })
})

router.get('/getStatusWiseEmpAttrition', (req, resp) => {
  let parsedUrl = url.parse(req.url);
  let parsedQs = querystring.parse(parsedUrl.query);
  let statusIds = parsedQs.statusIds || '';
  getStatusWiseAttrition(statusIds).then(response => {
      let arrOfStatus = [];
      _.forEach(response, (obj) => {
        arrOfStatus.push({
          name: obj.status_title,
          non_voluntary: obj.non_voluntary,
          voluntary: obj.voluntary,
        })
      })
      send200(resp,arrOfStatus)
    }).catch(err => {
        send400(resp,err);
    })
})

router.get('/getBUWiseEmpAttrition', (req, resp) => {
  let parsedUrl = url.parse(req.url);
  let parsedQs = querystring.parse(parsedUrl.query);
  let groupIds = parsedQs.groupIds || null;

  getBUWiseEmpAttrition(groupIds).then(response => {
    let arrOfStatus = [];
    
    _.forEach(response, (obj) => {
      
      arrOfStatus.push({
        name: obj.bu_name,
        ptt: obj.total_terminated_count,
        volptt: obj.voluntary_attrition,
      })
    })
    send200(resp,arrOfStatus);
  }).catch(err => {
        send400(resp,err);
  })
})

router.get('/getIcplExpWiseEmpAttrition', (req, resp) => {
  getIcplExpWiseAttrition().then(response => {
      let arrOfStatus = [];
      _.forEach(response, (obj) => {
        arrOfStatus.push({
          employee_count: obj.total_terminated_count,
          experience: obj.experience,
        })
      })
      send200(resp,arrOfStatus)
    }).catch(err => {
        send400(resp,err);
    })
})

router.get('/getBandAndBUWiseEmpCount', (req, resp) => {
  let parsedUrl = url.parse(req.url);
  let parsedQs = querystring.parse(parsedUrl.query);
  let bandIds = parsedQs.bandIds || '';
  let groupIds = parsedQs.groupIds || '';
  let locationIds = parsedQs.locationIds || '';
  getHeadCountWithBUAndBand(bandIds,groupIds,locationIds).then(response => {
        const finalArray = getTabularResponse(response,"band","bu_name");
        send200(resp,finalArray)
    }).catch(err => {
        send400(resp,err);
    })
  })

  router.get('/getBandAndIcplExpWiseEmpCount', (req, resp) => {
    let parsedUrl = url.parse(req.url);
    let parsedQs = querystring.parse(parsedUrl.query);
    let bandIds = parsedQs.bandIds || '';
    let locationIds = parsedQs.locationIds || '';
    getHeadCountWithExperienceAndBand(bandIds,locationIds).then(response => {
          const icplExpArray = getTabularResponseForExperience(response,"band","icpl_exp");
          send200(resp,icplExpArray)
      }).catch(err => {
          send400(resp,err);
      })
    })

    router.get('/getBandAndTotalExpWiseEmpCount', (req, resp) => {
      let parsedUrl = url.parse(req.url);
      let parsedQs = querystring.parse(parsedUrl.query);
      let bandIds = parsedQs.bandIds || '';
      let locationIds = parsedQs.locationIds || '';
      getHeadCountWithTotalExperienceAndBand(bandIds,locationIds).then(response => {
            const totalExpArray = getTabularResponseForExperience(response,"band","total_exp");
            send200(resp,totalExpArray)
        }).catch(err => {
            send400(resp,err);
        })
      })

    router.get('/getIcplExpVsBuWiseCount', (req, resp) => {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        let groupIds = parsedQs.groupIds || null;
        getIcplExpVsBuWiseCount(groupIds).then(response => {
            let finalArray = getTabularResponseForExperience(response,"bu_name","experience");
            finalArray = finalArray.map((rowItem) => {
             const rowData = _.orderBy(rowItem.rowData, ['columnName'],['asc']);
             return {...rowItem, rowData:rowData};
            });
            send200(resp,finalArray)
          }).catch(err => {
              send400(resp,err);
          })
      })

      router.get('/getBUAndTotalExpWiseEmpCount', (req, resp) => {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        let groupIds = parsedQs.groupIds || null;
        getTotalExpVsBuWiseCount(groupIds).then(response => {
              const totalExpArray = getTabularResponseForExperience(response,"bu_name","total_exp");
              send200(resp,totalExpArray)
          }).catch(err => {
              send400(resp,err);
          })
        })

  router.get('/getReasonWiseVolTerminatedCount', (req, resp) => {
    let parsedUrl = url.parse(req.url);
    let parsedQs = querystring.parse(parsedUrl.query);
    let startDate = parsedQs.startDate;
    let endDate = parsedQs.endDate;

    if(startDate){
      if(!validateDate(startDate)){
        send403(resp,{
          message: "Start date is in invalid format.",
        })
        return
      }
    } else {
      send403(resp,{
        message: "Start date is required.",
      })
      return
    }
    
    if(endDate){
      if(!validateDate(endDate)){
        send403(resp,{
          message: "End date is in invalid format.",
        })
        return
      }
    } else {
      send403(resp,{
        message: "End date is required.",
      })
      return
    }

    getReasonWiseEmpTerminatedCount(startDate,endDate).then(response => {
          const totalTerminatedEmployees = response.reduce((a, b) => a + b.employee_count, 0)

          const arrofParent = response.map(objReason => objReason.reason_id_parent);
          const uniqueParentArr = arrofParent.filter(function(item, pos) {
            return arrofParent.indexOf(item) == pos;
          })

          const finalParentArray = uniqueParentArr.map(objReason => {
            const obj = {}
            const childArray = response.filter(objR => objR.reason_id_parent === objReason)
            const totalChildEmpCount = childArray.reduce((a, b) => a + b.employee_count, 0)
            obj.reason_id_parent = objReason;
            obj.reason_id_parent_name = childArray[0].reason_id_parent_name;
            obj.country = childArray[0].country
            obj.employye_count = totalChildEmpCount
            obj.percentage = ((totalChildEmpCount/totalTerminatedEmployees) * 100).toFixed(2)
            return obj
          })

          const finalChildArray = response.map(obj => {
            return ({
              ...obj,
              percentage: ((obj.employee_count/totalTerminatedEmployees) * 100).toFixed(2)
            })
          })
          send200(resp,{
            level0: finalParentArray,
            reasonsInDepth: finalChildArray,
          })
      }).catch(err => {
          send400(resp,err);
      })
    })

module.exports = router;