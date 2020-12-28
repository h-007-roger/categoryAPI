'use strict';
const Logger = require('../../common/utils/logger');

const Utils = require('../../common/utils/util');
const CONSTANTS = require('../../common/utils/constant');
var _ = require('lodash');
const {
    getCategoryData,
    createCategory,
    updateCategory,
    deleteCategoryWithSubCategories,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    setDefaultEntriesInCategoryAndSubCategory,
} = require('../../db/sql-coonection');


class CategoryService {
    /**
     * Staff API Middlewares
     */
    constructor() {
        //super();
        this.logger = new Logger();
    }

    async createCategory(requestData) {
        let { info } = this.logger;
        try {
            return createCategory(requestData.name)
        } catch (err) {
            info(err);
        }
    }

    async updateCategory(requestData) {
        let { info } = this.logger;
        try {
            return updateCategory(requestData.cat_id,requestData.name)
        } catch (err) {
            info(err);
        }
    }

    async deleteCategory(requestData) {
        let { info } = this.logger;
        try {
            return deleteCategoryWithSubCategories(requestData.cat_id)
        } catch (err) {
            info(err);
        }
    }

    async createSubCategory(requestData) {
        let { info } = this.logger;
        try {
            return createSubCategory(requestData.name, requestData.cat_id)
        } catch (err) {
            info(err);
        }
    }

    async updateSubCategory(requestData) {
        let { info } = this.logger;
        try {
            return updateSubCategory(requestData.name, requestData.sub_cat_id)
        } catch (err) {
            info(err);
        }
    }

    async deleteSubCategory(requestData) {
        let { info } = this.logger;
        try {
            return deleteSubCategory(requestData.sub_cat_id)
        } catch (err) {
            info(err);
        }
    }

    async getCategoriesList() {
        try {
            return getCategoryData()
        } catch (err) {
            return new Promise((resolve, reject) => reject(err))
        }
    }

    async createDefaultEntriesWithTable() {
        try {
            return setDefaultEntriesInCategoryAndSubCategory()
        } catch (err) {
            return new Promise((resolve, reject) => reject(err))
        }
    }
}
module.exports = new CategoryService();
