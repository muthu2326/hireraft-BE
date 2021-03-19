exports.getFilterCondition = function (filter) {
    condition = {}
    var conditionflag = false;

    for (key in filter) {
        switch (key) {
            case "experience":
                if (filter[key].min >= 0 && filter[key].max >= 0) {
                    conditionflag = true;
                    condition["experience_min"] = {};
                    condition["experience_min"]["$gte"] = filter[key].min;

                    condition["experience_max"] = {};
                    condition["experience_max"]["$lte"] = filter[key].max;
                }
                break;
            case "salary":
                if (filter[key].min >= 0 && filter[key].max >= 0) {
                    conditionflag = true;
                    condition["salary_min"] = {};
                    condition["salary_min"]["$gte"] = filter[key].min;

                    condition["salary_max"] = {};
                    condition["salary_max"]["$lte"] = filter[key].max;
                }
                break;
            case "skills":
                if (filter[key] != "-1") {
                    conditionflag = true;
                    condition["skills_required"] = {
                        $regex: filter.skills,
                        $options: 'i'
                    }
                }
                break;
            case "location":
                if (filter[key] != "-1") {
                    conditionflag = true;
                    let locations = []
                    if (filter.location) {
                        if (filter.location.length > 0) {
                            filter.location.forEach((loc) => {
                                let obj = {
                                    "company_address": {
                                        $regex: `${loc}`,
                                        $options: 'i'
                                    }
                                }
                                locations.push(obj)
                            })
                        }
                        condition["$or"] = locations

                        // condition["company_address"] = {
                        //     $regex: filter.location, 
                        //     $options: 'i'
                        // }
                    }
                }
                break;
            default:
                console.log("Not a valid filter ::: ", key);
        }
    }

    condition.company_address = { $ne: null }
    condition.role = { $ne: null }
    condition.employment_type = { $ne: null }
    
    return condition;

}

exports.checkRequestBody = function (data) {
    var v = new lib.Validator('filter:object');
    if (!v.run(data)) {
        return {
            "error": true,
            "message": v.errors
        }
    }

    v = new lib.Validator('experience:object,salary:object,skills:string')
    if (!v.run(data.filter)) {
        return {
            "error": true,
            "message": {
                "filter": v.errors
            }
        };
    }

    v = new lib.Validator('min:number,max:number');
    if (!v.run(data.filter.experience)) {
        return {
            "error": true,
            "message": {
                "experience": v.errors
            }
        };
    }

    if (!v.run(data.filter.salary)) {
        return {
            "error": true,
            "message": {
                "salary": v.errors
            }
        }
    }

    return {
        "error": false
    }
}