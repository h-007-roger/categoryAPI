'use strict';

const ApiCategory = require('./api/category.js');

module.exports = (app) => {
    // Load Category API Routes
    app.use('/category', new ApiCategory(app));

};
