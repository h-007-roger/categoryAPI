'use strict';
const { error } = require('winston');
var _ = require('lodash');
const { Response, HttpCodes } = require('../../common/helpers/response')
const Logger = require('../../common/utils/logger');
var CategoryService = require('./category.service');


class CategoryController  {
    /**
     * Staff API Middlewares
     */
	constructor() {
		//super();
		this.logger = new Logger();
        this.createCategory = this.createCategory.bind(this);
        this.updateCategory = this.updateCategory.bind(this);
        this.deleteCategory = this.deleteCategory.bind(this);
        this.createSubCategory = this.createSubCategory.bind(this);
        this.updateSubCategory = this.updateSubCategory.bind(this);
        this.deleteSubCategory = this.deleteSubCategory.bind(this);
        this.getCategoriesList = this.getCategoriesList.bind(this);
        this.createDefaultEntriesWithTable = this.createDefaultEntriesWithTable.bind(this);
        this.convertCatRespToDictFormet = this.convertCatRespToDictFormet.bind(this);
	}


	/**
	 * Get create category Summary 
	 * @param  {Object} req
	 * @param  {Object} res
	 */
    async createCategory (req, res) {
        let { info } = this.logger;
        info(req.body)
        let response = new Response(req, res);
        try {
           let resp = await  CategoryService.createCategory(req.body);
            response.data(resp).status(HttpCodes.OK).send();
        } catch (err) {
          //info(err);
          response.error(err).status(HttpCodes.INTERNAL_SERVER_ERROR).send();
        }
    }

    /**
	 * Get update category Summary 
	 * @param  {Object} req
	 * @param  {Object} res
	 */
    async updateCategory (req, res) {
        let { info } = this.logger;
        info(req.body)
        let response = new Response(req, res);
        try {
            if(req.body && !req.body.cat_id){
                throw new Error('Category id is required')
            }

            if(req.body && !req.body.name){
                throw new Error('Category name is required')
            }
           let resp = await  CategoryService.updateCategory(req.body);
            response.data(resp).status(HttpCodes.OK).send();
        } catch (err) {
          console.log(err);
          response.error(err).status(HttpCodes.INTERNAL_SERVER_ERROR).send();
        }
    }

    /**
	 * Get delete category Summary 
	 * @param  {Object} req
	 * @param  {Object} res
	 */
    async deleteCategory (req, res) {
        let response = new Response(req, res);
        try {
            if(req.body && !req.body.cat_id){
                throw new Error('Category id is required')
            }

           let resp = await  CategoryService.deleteCategory(req.body);
            response.data(resp).status(HttpCodes.OK).send();
        } catch (err) {
          console.log(err);
          response.error(err).status(HttpCodes.INTERNAL_SERVER_ERROR).send();
        }
    }

    /**
	 * Get create sub-category Summary 
	 * @param  {Object} req
	 * @param  {Object} res
	 */
    async createSubCategory (req, res) {
        let { info } = this.logger;
        info(req.body)
        let response = new Response(req, res);
        try {
            if(req.body && !req.body.cat_id){
                throw new Error('Category id is required')
            }
            if(req.body && !req.body.name){
                throw new Error('Sub category name is required')
            }
           let resp = await  CategoryService.createSubCategory(req.body);
            response.data(resp).status(HttpCodes.OK).send();
        } catch (err) {
          //info(err);
          response.error(err).status(HttpCodes.INTERNAL_SERVER_ERROR).send();
        }
    }

    /**
	 * Get update sub-category Summary 
	 * @param  {Object} req
	 * @param  {Object} res
	 */
    async updateSubCategory (req, res) {
        let { info } = this.logger;
        info(req.body)
        let response = new Response(req, res);
        try {
            if(req.body && !req.body.sub_cat_id){
                throw new Error('Sub category id is required')
            }

            if(req.body && !req.body.name){
                throw new Error('Sub category name is required')
            }
           let resp = await  CategoryService.updateSubCategory(req.body);
            response.data(resp).status(HttpCodes.OK).send();
        } catch (err) {
          console.log(err);
          response.error(err).status(HttpCodes.INTERNAL_SERVER_ERROR).send();
        }
    }

    /**
	 * Get delete sub-category Summary 
	 * @param  {Object} req
	 * @param  {Object} res
	 */
    async deleteSubCategory (req, res) {
        let response = new Response(req, res);
        try {
            if(req.body && !req.body.sub_cat_id){
                throw new Error('sub category id is required')
            }

           let resp = await  CategoryService.deleteSubCategory(req.body);
            response.data(resp).status(HttpCodes.OK).send();
        } catch (err) {
          console.log(err);
          response.error(err).status(HttpCodes.INTERNAL_SERVER_ERROR).send();
        }
    }

    convertCatRespToDictFormet(resp){
        const arrCategory = [];
        var uniqCategory = _.uniq(_.map(resp, 'id'))
        for(let i=0; i<uniqCategory.length; i++ ){
            const objCategory = {"id":uniqCategory[i]}
            const arrOfFilter = resp.filter(obj => obj.id === uniqCategory[i]);
            objCategory.name = arrOfFilter[0].name;
            const arrOfSubCat = [];
            for(let j=0; j<arrOfFilter.length; j++ ){
                if(arrOfFilter[j].sub_cat_id){
                    arrOfSubCat.push({
                        sub_cat_id: arrOfFilter[j].sub_cat_id,
                        sub_cate_name: arrOfFilter[j].sub_cate_name
                    })
                }
            }
            objCategory.subCategory = arrOfSubCat;
            arrCategory.push(objCategory);
        }
        return arrCategory
    }

    /**
	 * Get category list with sub category
	 * @param  {Object} req
	 * @param  {Object} res
	 */
    async getCategoriesList (req, res) {
        let response = new Response(req, res);
        try {
           let resp = await  CategoryService.getCategoriesList(req.body);
            response.data(this.convertCatRespToDictFormet(resp)).status(HttpCodes.OK).send();
        } catch (err) {
          response.error(err).status(HttpCodes.INTERNAL_SERVER_ERROR).send();
        }
    }

    /**
	 * Get create category & sub-category table with deffault entries  
	 * @param  {Object} req
	 * @param  {Object} res
	 */
    async createDefaultEntriesWithTable (req, res) {
        let { info } = this.logger;
        info(req.body)
        let response = new Response(req, res);
        try {
           let resp = await  CategoryService.createDefaultEntriesWithTable(req.body);
            response.data(this.convertCatRespToDictFormet(resp)).status(HttpCodes.OK).send();
        } catch (err) {
          //info(err);
          response.error(err).status(HttpCodes.INTERNAL_SERVER_ERROR).send();
        }
    }
}

module.exports =new CategoryController();