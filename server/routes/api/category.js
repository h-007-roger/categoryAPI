'use strict';

const  Router  = require('express');
const cors = require('cors')
const ApiBase = require('./base');


const CategoryController = require('../../modules/category/category.controller.js');

/**
 * Api Dashboard Router
 */
class ApiCategory extends ApiBase {
    /**
     * @param {Express} app
     * @return {Router}
     */
    constructor(app) {
		super(app);


        this.router.use('/', new Router()
            .post('/createCategory', cors(),  CategoryController.createCategory)
            .post('/updateCategory', cors(),  CategoryController.updateCategory)
            .delete('/deleteCategory', cors(),  CategoryController.deleteCategory)
            .post('/createSubCategory', cors(),  CategoryController.createSubCategory)
            .post('/updateSubCategory', cors(),  CategoryController.updateSubCategory)
            .delete('/deleteSubCategory', cors(),  CategoryController.deleteSubCategory)
            .post('/defaultEntriesWithTable',cors(), CategoryController.createDefaultEntriesWithTable)
            
            .get('/getCategoriesList', cors(),  CategoryController.getCategoriesList)
          
		);

    	return this.router;
	}

    /**
     * API version
     */
	get VERSION() {
		return '1';
	}
}

module.exports = ApiCategory;