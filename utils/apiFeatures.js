class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        //console.log(req.query)
        //Filtering
        const queryObject = {...this.queryString };

        const excludeFields = ['page', 'sort', 'limit', 'fields'];

        excludeFields.forEach(el => delete queryObject[el]) //exclude for req.quey
            //2 Advance filtering
        let queryStr = JSON.stringify(queryObject);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        //{difficult:'easy',duration:{$gte:5}}}

        this.query = this.query.find(JSON.parse(queryStr));


        // Execute query
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }
    limitFields() {
        //3) Field Limiting
        if (this.queryString.fields) {

            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v'); //exclude only this field
        }
        return this;
    }
    paginate() {
        //4)Pagination
        //page=2&limit=10
        const page = +this.queryString.page || 1;
        const limit = +this.queryString.limit || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit)
        return this;
    }

}
module.exports = APIFeatures;