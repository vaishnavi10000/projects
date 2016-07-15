angular
    .module('transportApp').constant('globalConfig', {
        apiURL: "",
        appEnv: "dev",
        constantMsg:{
            "Mobile_no":"Mobile number already exists"
        },
    regPattern:{
        "address":/^(?![0-9\\.,\-\_.,\/()&${}'"]*$)[a-zA-Z0-9 \\.,\-\_.,\/()&${}'"\[\] ]{3,100}$/,
        "lat":/^(\+|-)?(?:90(?:(?:\.0{1,50})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,50})?))$/,
        "long":/^[+-]?((90\.?0*$)|(([0-8]?[0-9])\.?[0-9]*$))/,
        "Name":/^(?![0-9\-\_/() {}<>])[a-zA-Z0-9\-\_/() {}<>]{2,50}[a-zA-Z0-9]+$/,
        "route_no":/^[a-zA-Z0-9](?:[a-zA-Z0-9_-]*[a-zA-Z0-9])?$/,
        "mobileNumber":/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
		"vehicleNumber":/^[a-zA-Z0-9]*$/
    }

    })