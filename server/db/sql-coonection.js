const _ = require('lodash');
var mysql = require('mysql');
console.log(process.env.DB_USER, process.env.DB_PASSWORD)
var con = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: "category",
    host: "localhost",
    user: "root",
    password: "h@rshsh@h1993",
    database: "category",
});

const connect = (callback) => {
    if (con.state === "authenticated" ) {
        callback()
    } else {
        con.connect((err) => {
            if (err) {
                callback(err)
            }
            return callback()
        })
    }
}

const checkCategoryTableIsExistsOrNot = () => {
    return new Promise((resolve, reject) => {
        connect((err) => {
            if (!err) {
                con.query(`SELECT * 
                FROM information_schema.tables
                WHERE table_schema = 'category' 
                    AND table_name = 'category'
                LIMIT 1;`, function (errQuery, result, fields) {
                    if (errQuery) {
                        reject(errQuery);
                    }
                    else {
                        resolve(result)
                    }
                });
            }
        })
    })
}

const setDefaultEntriesInCategoryAndSubCategory = () => {
    return new Promise((resolve, reject) => {
        connect((err) => {
            if (!err) {
                checkCategoryTableIsExistsOrNot().then((arr => {
                    if(arr.length === 0){
                        con.query(`CREATE TABLE category.category (
                            id INT NOT NULL AUTO_INCREMENT,
                            name VARCHAR(45) NOT NULL,
                            PRIMARY KEY (id));`, function (errCreateCategory, resultCreateCategory, fieldsCreateCategory) {
                            if (errCreateCategory) {
                                reject(errCreateCategory);
                            }
                            else {
                                con.query(`CREATE TABLE category.subCategory (
                                    id INT NOT NULL AUTO_INCREMENT,
                                    name VARCHAR(45) NOT NULL,
                                    cat_id INT NOT NULL,
                                    PRIMARY KEY (id));`, function (errCreateSubCategory, resultCreateSubCategory, fieldsCreateSubCategory) {
                                    if (errCreateSubCategory) {
                                        reject(errCreateSubCategory);
                                    }
                                    else {
                                        con.query(`INSERT INTO category.subCategory (name, cat_id) VALUES ('Sofa', 1),
                                            ('Mobile', 2),
                                            ('Charger', 2)`,function (errInsertSubCategory, resultInsertSubCategory, fieldsInsertSubCategory) {
                                            if (errInsertSubCategory) {
                                                reject(errInsertSubCategory);
                                            }
                                            else {
                                                con.query(`INSERT INTO category.category (name) VALUES ('furniture'), ('electronics')`, function (errInsertCategory, resultInsertCategory, fieldsInsertCategory) {
                                            if (errInsertCategory) {
                                                reject(errInsertCategory);
                                            }
                                            else {
                                                getCategoryData().then(result => resolve(result)).catch(errFetch => reject(errFetch));
                                            }
                                        });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        getCategoryData().then(result => resolve(result)).catch(errFetch => reject(errFetch));
                    }
                })).catch(errOfTableAvailable => {
                    reject(errOfTableAvailable)
                })
            }
        })
    })
}

const getCategoryData = () => {
    return new Promise((resolve, reject) => {
        connect((err) => {
            if (!err) {
                con.query("SELECT category.id as id, category.name as name, subCategory.id as sub_cat_id, subCategory.name as sub_cate_name FROM category left join subCategory on category.id=subCategory.cat_id", function (errQuery, result, fields) {
                    if (errQuery) {
                        reject(errQuery);
                    }
                    else {
                        resolve(result)
                    }
                });
            }
    
        })
    })
}

const createCategory = (categoryName) => {
    return new Promise((resolve, reject) => {
        connect((err) => {
            if (!err) {
                console.log(`INSERT into category (name) values (${categoryName})`)
                con.query(`INSERT into category (name) values ('${categoryName}')`, function (errQuery, result, fields) {
                    if (errQuery) {
                        reject(errQuery);
                    }
                    else {
                        resolve({
                            success: "Category is created successfully."
                        })
                    }
                });
            }
    
        })
    })
}

const updateCategory = (cat_id,categoryName) => {
    return new Promise((resolve, reject) => {
        connect((err) => {
            if (!err) {
                console.log(`UPDATE category SET name = '${categoryName}' WHERE id = ${cat_id};`)
                con.query(`UPDATE category SET name = '${categoryName}' WHERE id = ${cat_id};`, function (errQuery, result, fields) {
                    if (errQuery) {
                        reject(errQuery);
                    }
                    else {
                        resolve({
                            success: "Category is updated successfully"
                        })
                    }
                });
            }
        })
    })
}

const deleteCategoryWithSubCategories = (cat_id) => {
    return new Promise((resolve, reject) => {
        connect((err) => {
            if (!err) {
                con.query(`DELETE FROM category WHERE id=${cat_id};`, function (errQuery, result, fields) {
                    if (errQuery) {
                        reject(errQuery);
                    }
                    else {
                        con.query(`DELETE FROM subCategory WHERE cat_id=${cat_id};`, function (errSubQuery, subResult, subFields) {
                            if (errSubQuery) {
                                reject(errSubQuery);
                            }
                            else {
                                resolve({
                                    success: 'category with its all related subcategories deleted Successfully.'
                                })
                            }
                        })
                    }
                });
            }
        })
    })
}

const createSubCategory = (subCategoryName, cat_id) => {
    return new Promise((resolve, reject) => {
        connect((err) => {
            if (!err) {
                con.query(`INSERT into subCategory (name,cat_id) values ('${subCategoryName}',${cat_id})`, function (errQuery, result, fields) {
                    if (errQuery) {
                        reject(errQuery);
                    }
                    else {
                        resolve({
                            success: "SubCategory is created successfully."
                        })
                    }
                });
            }
    
        })
    })
}

const updateSubCategory = (subCategoryName,sub_cat_id) => {
    return new Promise((resolve, reject) => {
        connect((err) => {
            if (!err) {
                con.query(`UPDATE subCategory
                SET name = '${subCategoryName}'
                WHERE id = ${sub_cat_id};`, function (errQuery, result, fields) {
                    if (errQuery) {
                        reject(errQuery);
                    }
                    else {
                        resolve({
                            success: "Sub category is updated successfully."
                        })
                    }
                });
            }
        })
    })
}

const deleteSubCategory = (sub_cat_id) => {
    return new Promise((resolve, reject) => {
        connect((err) => {
            if (!err) {
                con.query(`DELETE FROM subCategory WHERE id=${sub_cat_id};`, function (errQuery, result, fields) {
                    if (errQuery) {
                        reject(errQuery);
                    }
                    else {
                        resolve({
                            success: "Subcategory is deleted successfully."
                        })
                    }
                });
            }
        })
    })
}


module.exports ={
    con,
    setDefaultEntriesInCategoryAndSubCategory,
    getCategoryData,
    createCategory,
    updateCategory,
    deleteCategoryWithSubCategories,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    connect
}