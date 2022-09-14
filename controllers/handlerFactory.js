const APIFeatures = require("../utils/apiFeatures");
const hookAsync = require("../utils/hookAsync");

exports.getAll = Model => hookAsync(async(req, res, next) => {


    const features = new APIFeatures(Model.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const doc = await features.query;

    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            doc
        }

    });


});


exports.getOne = (Model, popOptions) => hookAsync(async(req, res, next) => {
    let query = Model.findById(req.params.id)
    if (popOptions) query = query.populate(popOptions);

    const doc = await query


    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            doc
        }

    });



});