var indianCitiesJson = require("indian-cities-json")

exports.getStatesAndCities = (req, res) => {
    console.log("User Controller: entering getStatesAndCities")
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);   

    res.send({
        status: 200,
        data: indianCitiesJson.cities,
        err: {}
    })
    return;
}

