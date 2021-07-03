// jshint esversion: 6

function getDate(){
    const today = new Date();

    const options = {
        weekday : "long",
        day : "numeric",
        month : "long"
    }
    
    const formatedDay = today.toLocaleDateString("en-US", options)
    return formatedDay;
}

function getDay(){
    const today = new Date();

    const options = {
        weekday : "long",
    }
    
    const formatedDay = today.toLocaleDateString("en-US", options)
    return formatedDay;
}

module.exports = {getDate, getDay};
