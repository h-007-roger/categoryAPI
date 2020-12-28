const { RESP_MESSAGES } = require('./globalStrings')

const appendMessageToDictIfAvailable = (objResp, message) => {
    if(message !== '') { objResp.message =  message }
    return objResp
}

//Ok
const send200 = (resp,data, message = "") => {
    const objResp = appendMessageToDictIfAvailable({
        success: true,
        data
    }, message)
    return resp.status(200).send(objResp)
}

//Created
const send201 = (resp, data, message = "") => {
    const objResp = appendMessageToDictIfAvailable({
        success: true,
        data
    }, message)
    return resp.status(201).send(objResp)
}

//empty data
const send204 = (resp) => resp.status(204).send({
    success: true,
    message: RESP_MESSAGES.NO_DATA_FOUND,
});

const send401 = (resp) => {
    const objResp = {
        success: false,
        message: RESP_MESSAGES.UNAUTHORISED,
    }
    return resp.status(401).send(objResp)
}

//Bad request
const send400 = (resp, err) => resp.status(400).send({
    success: false,
    error: err
});

//Wrong Email or password
const send403 = (resp, err) => resp.status(403).send({
    success: false,
    error: err
});

//Internal error(Bug)
const send500 = (resp, err) => resp.status(500).send({
    success: false,
    error: err
});


module.exports = {
    send200,
    send201,
    send204,
    send400,
    send401,
    send403,
    send500
}