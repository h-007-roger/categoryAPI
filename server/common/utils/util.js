const Logger = require('./logger');
const CONSTANTS = require('./constant');
var _ = require('lodash');
class Utils {

    /**
     * Utils API Middlewares
     */
    constructor() {
        //super();
        this.logger = new Logger();
    }

    getRequestData(requestData) {
        let condition = {};
        if (requestData) {
            if (requestData.controlId) {
                condition.controlId = requestData.controlId
            }
            if (requestData.subControlId) {
                condition.subControlId = requestData.subControlId
            }
            if (requestData.userId) {
                condition.userId = requestData.userId
            }
            if (requestData.isParent) {
                condition.isParent = requestData.isParent
            }
            // if (requestData.roleId) {
            //    condition.roleId = requestData.roleId
            // }
        }
        return condition;
    }

    async getHTMLComponents(components) {
        const { HTMLView } = require('../../common/models/index');
        let { info } = this.logger;
        info("get HTML components");
        try {
            let htmlComponents = _.filter(components, (c) => {
                return c.type === CONSTANTS.HTMLTEXT || c.type == CONSTANTS.TEXTBOX || c.type == CONSTANTS.TEXT
                    || c.type == CONSTANTS.HEADER || c.type == CONSTANTS.TITLE || c.type == CONSTANTS.HTMLTEXTDIVIDER;
            });
            let mappedIdList = _.map(htmlComponents, 'mappedComponentId');
            if (mappedIdList && mappedIdList.length > 0) {
                return HTMLView.findAll({
                    where: {
                        id: mappedIdList
                    }
                }).then(htmlTextComponents => {
                    return (_.chain(htmlTextComponents).groupBy("id").value());
                });
            }
        } catch (err) {
            info(err);
        }
    }

    async getTextComponents(components) {
        const { TextView } = require('../../common/models/index');
        let { info } = this.logger;
        info("get text components");
        try {
            let textComponents = _.filter(components, (c) => {
                return c.type === CONSTANTS.URLWITHBULLETS;
            });
            let mappedIdList = _.map(textComponents, 'mappedComponentId');
            if (mappedIdList && mappedIdList.length > 0) {
                return TextView.findAll({
                    where: {
                        mappedComponentId: mappedIdList
                    }
                }).then(textComponents => {
                    return (_.chain(textComponents).groupBy("mappedComponentId").value());
                });
            }
        } catch (err) {
            info(err);
        }
    }

    async getButtonComponents(components) {
        const { ButtonView } = require('../../common/models/index');
        let { info } = this.logger;
        info("get Button components");
        let buttonComponents = _.filter(components, (c) => {
            return c.type === CONSTANTS.BUTTONBLUE || c.type === CONSTANTS.BUTTON;
        });
        let mappedIdList = _.map(buttonComponents, 'mappedComponentId');
        if (mappedIdList && mappedIdList.length > 0) {
            return ButtonView.findAll({
                where: {
                    id: mappedIdList
                }
            }).then(btnComponents => {
                return (_.chain(btnComponents).groupBy("id").value());
            });
        }
    }

    async getImageComponents(components) {
        const { ImageView } = require('../../common/models/index');
        let { info } = this.logger;

        info("get Image components");
        let imageComponents = _.filter(components, (c) => {
            return c.type === CONSTANTS.IMAGE && c.mappedComponentId != null;
        });
        let mappedIdList = _.map(imageComponents, 'mappedComponentId');
        if (mappedIdList && mappedIdList.length > 0) {
            return ImageView.findAll({
                where: {
                    id: mappedIdList
                }
            }).then(imgComponents => {
                return (_.chain(imgComponents).groupBy("id").value());
            });
        }
    }

    async getQuestionComponents(components) {
        const { ExperimentQuestion } = require('../../common/models/index');
        let { info } = this.logger;
        info("get Question Components")
        let questionComponents = _.filter(components, (c) => {
            return c.type === CONSTANTS.QUESTION;
        });
        let mappedIdList = _.map(questionComponents, 'mappedComponentId');
        //info(questionComponents)
        if (mappedIdList && mappedIdList.length > 0) {
            return ExperimentQuestion.findAll({
                where: { questionId: mappedIdList },
                include: ["questions"]
            }).then(async questions => {
                // info(questions);
                let jsonObj = await this.getQuestionOptions(questions);
                return jsonObj;
            });
        }
    }

    async getQuestionOptions(questions) {
        const { QuestionOptions } = require('../../common/models/index');
        let { info } = this.logger;
        info("getQuestionOptions");
        let questionIdList = _.map(questions, 'questionId');
        // info(questionIdList);
        if (questionIdList && questionIdList.length > 0) {
            return QuestionOptions.findAll({
                where: {
                    questionId: questionIdList
                },
                include: ["option"]
            }).then(async questionOptions => {
                let jsonObj = await this.getQuestionData(questions, questionOptions);
                return jsonObj;
            });
        }
    }

    async getQuestionData(questions, questionOptions) {
        let data = {};
        let questionList = _.map(questions, 'questions');
        questionList.forEach(question => {
            let obj = {};
            //obj.questionId = question.id;
            obj.text = question.text;
            obj.type = question.type;
            obj.placeHolderText = question.placeHolderText;
            obj.templateText = question.templateText;
            obj.options = _.filter(questionOptions, (option) => {
                return option.questionId === question.id;
            });
            data[question.id] = obj;
        })
        return data;
    }

    async getCustomComponents(components) {
        const { CustomComponent } = require('../../common/models/index');
        let { info } = this.logger;
        info("get custom components");
        let customComponents = _.filter(components, (c) => {
            return c.type === CONSTANTS.HTMLWITHBULLET || c.type == CONSTANTS.LISTVIEW || c.type == CONSTANTS.URLWITHBULLETS;
        });
        //info(customComponents);
        let mappedIdList = _.map(customComponents, 'mappedComponentId');
        let controlIdList = _.map(customComponents, 'moduleSequenceId');
        let moduleIdList = _.map(customComponents, 'moduleId');
        let moduleId = moduleIdList && moduleIdList.length > 0 ? moduleIdList[0] : null;
        let controlId = controlIdList && controlIdList.length > 0 ? controlIdList[0] : null;
        if (mappedIdList && mappedIdList.length > 0) {
            return CustomComponent.findAll({
                where: {
                    componentId: mappedIdList
                }
            }).then(async customComponents => {
                let htmlComponents = await this.getHTMLComponents(customComponents);
                let imgComponents = await this.getImageComponents(customComponents);
                let buttonComponents = await this.getButtonComponents(customComponents);
                return await this.createCustomJSONComponent(customComponents, htmlComponents, imgComponents, buttonComponents, null, controlId, moduleId);
            });
        }
    }
    async createCustomJSONComponent(customComponents, htmlComponents, imageComponents, buttonComponents, textComponents, controlId, moduleId) {
        let { info } = this.logger;
        info("get custom json components");
        let customComponentList = [];
        //info(textComponents);
        customComponents.forEach(component => {
            let obj = {};
            obj.type = component.type;
            obj.sortOrder = component.sortOrder;
            obj.sequenceId = component.sequenceId;
            obj.controlId = controlId;
            obj.moduleId = moduleId;
            obj.componentId = component.componentId;
            if (component.type == CONSTANTS.HTMLTEXT || component.type == CONSTANTS.HEADER || component.type == CONSTANTS.TITLE) {
                obj.text = htmlComponents[component.mappedComponentId][0].text;
            } else if (component.type == CONSTANTS.BUTTONBLUE || component.type == CONSTANTS.BUTTON) {
                obj.text = buttonComponents[component.mappedComponentId][0].text;
                // obj.redirectScreenId = component.redirectScreenId;
            } else if (component.type == CONSTANTS.IMAGE) {
                obj.text = imageComponents[component.mappedComponentId][0].text;
            } else if (component.type == CONSTANTS.URLWITHBULLETS) {
                obj.listURL = [];
                let urlListObj = textComponents[component.mappedComponentId];
                urlListObj.forEach(url => {
                    let urlObj = {};
                    urlObj.type = component.type;
                    urlObj.text = url.text;
                    urlObj.sequenceId = url.sequenceId;
                    urlObj.controlId = controlId;
                    urlObj.moduleId = moduleId;
                    obj.listURL.push(urlObj);
                })

                // obj.text = textComponents[component.mappedComponentId][0].text;
            }
            customComponentList.push(obj);
        });
        customComponentList = _.sortBy(customComponentList, [(o) => { return o.sortOrder; }]);
        return customComponentList;
    }

    async getGridViewComponents(components) {
        const { GridView } = require('../../common/models/index');
        let { info } = this.logger;
        info("get grid custom components");
        let customComponents = _.filter(components, (c) => {
            return c.type == CONSTANTS.GRIDVIEW;
        });
        let mappedIdList = _.map(customComponents, 'mappedComponentId');
        let controlIdList = _.map(customComponents, 'moduleSequenceId');
        let controlId = controlIdList && controlIdList.length > 0 ? controlIdList[0] : null;
        if (mappedIdList && mappedIdList.length > 0) {
            return GridView.findAll({
                where: {
                    mappedComponentId: mappedIdList
                }
            }).then(async gridComponents => {
                let customComponents = await this.getGridViewCustomComponents(gridComponents);
                return await this.createGridViewJSONComponent(gridComponents, customComponents);
            });
        }
    }

    async getGridViewCustomComponents(gridComponents) {
        const { CustomComponent } = require('../../common/models/index');
        let { info } = this.logger;
        info("get grid custom components");
        let customComponents = _.filter(gridComponents, (c) => {
            return c.customComponentId != null;
        });
        let mappedIdList = _.map(customComponents, 'customComponentId');
        let controlIdList = _.map(customComponents, 'moduleSequenceId');
        let controlId = controlIdList && controlIdList.length > 0 ? controlIdList[0] : null;
        let moduleIdList = _.map(customComponents, 'moduleId');
        let moduleId = moduleIdList && moduleIdList.length > 0 ? moduleIdList[0] : null;
        if (mappedIdList && mappedIdList.length > 0) {
            return CustomComponent.findAll({
                where: {
                    componentId: mappedIdList
                }
            }).then(async customComponents => {
                let htmlComponents = await this.getHTMLComponents(customComponents);
                let imgComponents = await this.getImageComponents(customComponents);
                let buttonComponents = await this.getButtonComponents(customComponents);
                return await this.createCustomJSONComponent(customComponents, htmlComponents, imgComponents, buttonComponents, null, controlId, moduleId);
            });
        }
    }

    async createGridViewJSONComponent(gridComponents, customComponents) {
        let { info } = this.logger;
        info("createGridViewJSONComponent");
        let groupedCustomComponents = (_.chain(customComponents).groupBy("componentId").value());
        let grids = [];
        gridComponents.forEach(gridData => {
            let obj = {};
            obj.grid = {};
            obj.grid.image = gridData.image;
            obj.grid.highlightedImage = gridData.highlightedImage;
            obj.grid.sortOrder = gridData.sortOrder;
            let customData = groupedCustomComponents[gridData.customComponentId];
            var actionObj = {};
            actionObj.component = customData
            let grouped = _.chain(customData).groupBy("sequenceId")
                .map((value, key) => ({ components: value })).value();
            obj.grid.action = actionObj;
            grids.push(obj);
        });
        return grids;
    }

    async getListViewHeaderComponents(components) {
        const { CustomComponent } = require('../../common/models/index');
        let { info } = this.logger;
        info("get list header custom components");
        let customComponents = _.filter(components, (c) => {
            return c.type == CONSTANTS.LISTVIEWWITHHEADER;
        });
        let mappedIdList = _.map(customComponents, 'mappedComponentId');
        let controlIdList = _.map(customComponents, 'moduleSequenceId');
        let moduleIdList = _.map(customComponents, 'moduleId');
        let moduleId = moduleIdList && moduleIdList.length > 0 ? moduleIdList[0] : null;
        let controlId = controlIdList && controlIdList.length > 0 ? controlIdList[0] : null;
        if (mappedIdList && mappedIdList.length > 0) {
            return CustomComponent.findAll({
                where: {
                    componentId: mappedIdList
                }
            }).then(async customComponents => {
                let htmlComponents = await this.getHTMLComponents(customComponents);
                let imgComponents = await this.getImageComponents(customComponents);
                let buttonComponents = await this.getButtonComponents(customComponents);
                let textComponents = await this.getTextComponents(customComponents);
                let listHeaderData = await this.createCustomJSONComponent(customComponents, htmlComponents, imgComponents, buttonComponents, textComponents, controlId, moduleId);
                return await this.createListViewHeaderComponent(listHeaderData);
            });
        }
    }

    async createListViewHeaderComponent(listHeaderData) {
        let { info } = this.logger;
        info("get custom json for list view header components");
        let headerComponents = _.filter(listHeaderData, (c) => {
            return c.sequenceId == null;
        });
        let detailComponents = _.filter(listHeaderData, (c) => {
            return c.sequenceId != null;
        });
        detailComponents = _.sortBy(detailComponents, [(o) => { return o.sortOrder; }]);
        let groupedHeader = (_.chain(headerComponents).groupBy("componentId").value());
        let groupedDetail = (_.chain(detailComponents).groupBy("componentId").value());
        let headerKeys = _.keys(groupedHeader);
        let headerKeyMap = {};
        headerKeys.forEach(key => {
            let obj = {};
            obj.text = groupedHeader[key][0].text;
            let objDtl = groupedDetail[key];
            let grouped = _.chain(objDtl).groupBy("sequenceId")
                .map((value, key) => ({ components: value })).value();
            obj.list = [];
            obj.list = grouped;
            headerKeyMap[key] = obj;
        });
        return headerKeyMap;
    }


    async createJSONObj(components, htmlComponents, buttonComponents, imageComponents, customComponents, gridViewComponents, listViewHeaderComponents, screenId) {
        let { info } = this.logger;
        let jsonObj = {};
        let componentList = [];
        try {
            info("create json obj");
            await components.forEach(component => {
                let obj = {};
                obj.type = component.type;
                obj.sortOrder = component.sortOrder;
                obj.controlId = component.moduleSequenceId;
                obj.sequenceId = component.screenId;
                obj.moduleId = component.moduleId;
                if (component.type == CONSTANTS.HTMLTEXT || component.type == CONSTANTS.TEXTBOX || component.type == CONSTANTS.HEADER) {
                    obj.text = htmlComponents[component.mappedComponentId][0].text;
                } else if (component.type == CONSTANTS.BUTTONBLUE || component.type == CONSTANTS.BUTTON) {
                    obj.text = buttonComponents[component.mappedComponentId][0].text;
                    obj.redirectScreenId = component.redirectScreenId;
                } else if (component.type == CONSTANTS.IMAGE) {
                    obj.text = imageComponents[component.mappedComponentId][0].text;
                    obj.redirectScreenId = component.redirectScreenId;
                } else if (component.type == CONSTANTS.HTMLWITHBULLET || component.type == CONSTANTS.LISTVIEW) {
                    let groupedCustomComponents = _.chain(customComponents).groupBy("sequenceId")
                        .map((value, key) => ({ components: value }))
                        .value();
                    obj.list = groupedCustomComponents;
                } else if (component.type == CONSTANTS.LISTVIEWWITHHEADER) {
                    let listHeaderData = listViewHeaderComponents[component.mappedComponentId];
                    obj.text = listHeaderData.text;
                    obj.list = listHeaderData.list;
                } else if (component.type == CONSTANTS.GRIDVIEW) {
                    obj.gridCountPerRow = component.gridCountPerRow;
                    obj.grids = gridViewComponents;
                }
                componentList.push(obj);
            });

            if (!_.isEmpty(gridViewComponents)) {
                jsonObj = componentList
            }
            else if (_.isEmpty(listViewHeaderComponents) && _.isEmpty(gridViewComponents) && _.isEmpty(customComponents)) {
                jsonObj.controls = [];
                jsonObj.controls.push({ components: componentList });
            } else {
                jsonObj.components = [];
                jsonObj.components = componentList;
            }
        } catch (err) {
            info(err);
        }
        return (jsonObj);
    }

    getControlArmRequestData(requestData) {
        let obj = {};
        if (requestData.controlId) {
            obj.moduleSequenceId = requestData.controlId;
        }
        if (requestData.subControlId) {
            obj.screenId = requestData.subControlId;
        }
        if (requestData.isParent) {
            obj.isParent = requestData.isParent;
        }
        obj.moduleId = CONSTANTS.MODULE.CONTROL;
        return obj;
    }

    getExpRequestData(requestData) {
        let obj = {};
        if (requestData.experimentId) {
            obj.moduleSequenceId = requestData.experimentId;
        }
        if (requestData.screenId) {
            obj.screenId = requestData.screenId;
        }
        if (requestData.isParent) {
            obj.isParent = requestData.isParent;
        }
        obj.moduleId = CONSTANTS.MODULE.EXPERIMENT;
        return obj;
    }

    getToolboxRequestData(requestData) {
        let obj = {};
        if (requestData.controlId) {
            obj.moduleSequenceId = requestData.controlId;
        }
        if (requestData.isParent) {
            obj.isParent = requestData.isParent;
        }
        obj.moduleId = CONSTANTS.MODULE.TOOLBOX;
        return obj;
    }
    getJournalRequestData(requestData) {
        let obj = {};
        if (requestData.isParent) {
            obj.isParent = requestData.isParent;
        }
        obj.moduleId = CONSTANTS.MODULE.JOURNAL;
        return obj;
    }
    getPopupRequestData(requestData) {
        let obj = {};
        if (requestData.controlId) {
            obj.moduleSequenceId = requestData.controlId;
        }
        obj.moduleId = requestData.moduleId;
        return obj;
    }

    getHelpRequestData(requestData) {
        let obj = {};
        if (requestData.isParent) {
            obj.isParent = requestData.isParent;
        }
        obj.moduleId = CONSTANTS.MODULE.HELP;
        return obj;
    }

    getMenuRequestData(requestData) {
        let obj = {};
        if (requestData.experimentId) {
            obj.moduleSequenceId = requestData.experimentId;
        }
        if (requestData.screenId) {
            obj.screenId = requestData.screenId;
        }
        // obj.moduleId = CONSTANTS.MODULE.HELP;
        return obj;
    }
}
module.exports = new Utils();
