const employeeTemplateModel = require("../models/Employee-Template-Model");
const employeeComponentModel = require("../models/Employee-Component-Model");
const signUpModel = require("../models/Signup-Model");
const templateTypeModel = require("../models/Template-Types-Model");
const nodemailer = require("nodemailer");
const libraryTemplatesModel = require("../models/Library-Templates-Model");
const userFeedbackModel = require('../models/User-Feedback-Model');
const html_to_pdf = require('html-pdf-node');
const globalTemplateModel = require('../models/Global-templates-Model');
const globalPlaceholderTypeModel = require('../models/Global-Template-Type-Model');
const generatedDocumentModel = require("../models/Generated-Documents-Model")
require("dotenv").config();
const config = process.env;

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.INVOICE_SENDING_EMAIL,
    pass: config.INVOICE_SENDING_PASSWORD,
  },
});

//POST SEND INVOICE PDF TO RECIPIENT EMAIL
const sendInvoiceThroughEmail = (req, res) => { 
  try {
    let options = { format: 'A4' };
    let file = { content: `${req.body.invoice}`};

    html_to_pdf.generatePdf(file, options)
    .then(pdfBuffer => {
      let mailDetails = {
        from: config.INVOICE_SENDING_EMAIL,
        to: req.params.recipientEmail,
        subject: `VIRTUEVISE INVOICE`,
        attachments: [
          {
            filename: "Invoice.pdf",
            content: pdfBuffer
          },
        ],
      };
      mailTransporter.sendMail(mailDetails, (err) => {
        if (err) {
          res.send({ status: 400, message: err });
        } else {
          res.send({ status: 200, message: `Email sent` });
        }
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//POST EMPLOYEE TEMPLATE
const createEmployeeTemplate = async (req, res) => {
  const { templateData, editorData } = req.body;
  const stepOneData = templateData.filter((x) => x.stepName === "basic")[0];
  const stepTwoData = templateData.filter((x) => x.stepName === "component");

  try {
    if (stepOneData && stepTwoData.length) {
      const stepOne = new employeeTemplateModel({
        ...stepOneData,
        createdat: new Date(),
      });
      await stepOne.save();

      const stepTwoPromises = stepTwoData.map((data) => {
        const stepTwo = new employeeComponentModel({
          ...data,
          createdat: new Date(),
        });
        return stepTwo.save();
      });
      await Promise.all(stepTwoPromises);

      const customTemplate = new libraryTemplatesModel({
        ...editorData,
        createdat: new Date(),
      });
      await customTemplate.save();

      res.send({ status: 200, message: "Template created" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//PUT EMPLOYEE TEMPLATE
const updateEmployeeTemplate = async (req, res) => {
  try {
    const { templateData, htmlText, editorData } = req.body;
    const stepOneData = templateData.find((x) => x.stepName === "basic");
    const stepTwoData = templateData.filter((x) => x.stepName === "component");

    await employeeTemplateModel.findOneAndUpdate(
      { templateid: req.params.templateid },
      {
        templateid: stepOneData.templateid,
        templatename: stepOneData.templatename,
        templatedescription: stepOneData.templatedescription,
        templatetype: stepOneData.templatetype,
        status: stepOneData.status,
        modifiedat: new Date(),
        htmltext: htmlText,
      }
    );

    const componentToUpdateId = stepTwoData.filter((x) => x._id);
    const componentToAdd = stepTwoData.filter((x) => !x._id);

    await Promise.all([
      ...componentToUpdateId.map(async (component, i) => {
        await employeeComponentModel.findByIdAndUpdate(
          { _id: component._id },
          {
            templateid: stepTwoData[i].templateid,
            componentid: stepTwoData[i].componentid,
            componentname: stepTwoData[i].componentname,
            componenttype: stepTwoData[i].componenttype,
            mathoperator: stepTwoData[i].mathoperator,
            rule: stepTwoData[i].rule,
            hideifzero: stepTwoData[i].hideifzero,
            status: stepTwoData[i].status,
            modifiedat: new Date(),
          }
        );
      }),
      ...componentToAdd.map(async (component, i) => {
        const stepTwo = new employeeComponentModel({
          userid: component.userid,
          templateid: component.templateid,
          componentid: component.componentid,
          componentname: component.componentname,
          componenttype: component.componenttype,
          mathoperator: component.mathoperator,
          rule: component.rule,
          hideifzero: stepTwoData[i].hideifzero,
          status: component.status,
          createdat: new Date(),
        });
        await stepTwo.save();
      }),
      libraryTemplatesModel.findOneAndUpdate(
        { templateid: editorData.templateid },
        {
          html: editorData.html,
          modifiedat: new Date(),
        }
      ),
    ]);

    res.send({ status: 200, message: "Template updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//DELETE EMPLOYEE COMPONENT
const deleteEmployeeComponent = async (req, res) => {
  try {
    const data = await employeeComponentModel.findOneAndDelete({ componentid: req.params.componentid });
    if (data) {
      res.send({ status: 200, message: "Component deleted" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//DELETE EMPLOYEE RELATED COMPONENTS
const deleteEmployeeRelatedComponent = (req, res) => {
  try {
    employeeComponentModel.deleteMany(
      { templateid: req.params.templateid },
      (err, deletedComponents) => {
        if (deletedComponents) {
          res.send({ status: 200, message: "Components deleted" });
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//DELETE EMPLOYEE TEMPLATE
const deleteEmployeeTemplate = async (req, res) => {
  const templateid = req.params.templateid;

  try {
    const deletedEmployeeTemplate = await employeeTemplateModel.findOneAndDelete({ templateid });
    if (!deletedEmployeeTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    await employeeComponentModel.deleteMany({ templateid });
    await libraryTemplatesModel.findOneAndDelete({ templateid });

    res.send({ status: 200, message: "Template deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//GET ALL EMPLOYEES TEMPLATES
const getEmployeeTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 5, searchedKeyword, sortBy } = req.query;
    const size = parseInt(limit);
    const skip = (page - 1) * size;

    const userid = req.params.id;
    const templateDataQuery = { userid };

    if (searchedKeyword) {
      const regex = new RegExp(searchedKeyword, 'i');
      templateDataQuery.templatename = regex;
    }

    let templateDataSort = {};
    if (sortBy) {
      switch (sortBy) {
        case 'Name':
          templateDataSort.templatename = 1;
          break;
        case 'Status':
          templateDataSort.status = -1;
          break;
        case 'Last Updated':
          templateDataSort.modifiedat = -1;
          break;
        default:
          break;
      }
    }

    const [componentData, libraryData, templateData, totalCountData] = await Promise.all([
      employeeComponentModel.find({ userid }).lean(),
      libraryTemplatesModel.find({ userid }).lean(),
      employeeTemplateModel.find(templateDataQuery)
        .sort(templateDataSort)
        .collation({ locale: 'en', strength: 2 })
        .limit(size)
        .skip(skip)
        .lean(),
      employeeTemplateModel.countDocuments(templateDataQuery)
    ]);

    const totalDataCount = totalCountData || 0;

    res.json({
      status: 200,
      message: 'success',
      templateData,
      componentData,
      libraryData,
      totalDataCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

//UPDATE TEMPLATE STATUS
const templateStatusChange = async (req, res) => {
  try {
    const { templateid, status } = req.params;

    const data = await employeeTemplateModel.findOneAndUpdate(
      { templateid },
      { status, modifiedat: new Date() }
    );

    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json({ status: 200, message: "Status updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//GET TEMPLATE TYPE
const getTemplatesType = async (req, res) => {
  try {

    const defaultTypes = await templateTypeModel.find({userid: {$exists: false}});
    const newTypesAdded = await templateTypeModel.find({userid: req.params.id});

    res.json({
      status: 200,
      message: "success",
      defaultTypes: defaultTypes,
      newTypesAdded: newTypesAdded,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//POST NEW TEMPLATE TYPE
const addNewTemplateType = async (req, res) => {
  try {
    const newType = new templateTypeModel({
      userid: req.params.id,
      templatetype: req.body.newTemplateType,
      createdat: new Date()
    });
    await newType.save();

    res.send({ status: 200, message: "Added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//DELETE ADDED TEMPLATE TYPE
const deleteAddedTemplateType = async (req, res) => {
  try {
    await templateTypeModel.findOneAndDelete({ _id: req.params.id });
    res.send({ status: 200, message: "Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//GET CHECK TEMPLATE TYPE EXIST
const checkTemplateNameExist = async (req, res) => {
  const _id = req.params._id;
  const templateNameToCheck = req.params.checkTemplateName;

  try {
    const existingTemplates = await employeeTemplateModel.findOne({
      userid: { $in: _id },
      templatename: templateNameToCheck
    });

    if (existingTemplates) {
      res.send({
        status: 400,
        message: 'Template name already exists. Please use a different name.'
      });
    } else {
      res.send({status: 200})
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

//GET EMPLOYEE TEMPLATES
const getEmployeeTemplatesWhileScroll = async (req, res) => {
  try {
    const { page , limit } = req.query;
    const size = parseInt(limit);
    const skip = (page - 1) * size;
    
    const [templateData] = await Promise.all([
      employeeTemplateModel.find({ userid: req.params.id }).limit(size).skip(skip)
    ]);

    res.json({
      status: 200,
      message: "success",
      templateData
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//GET VERIFY TEMPLATE
const verifyTemplate = async (req,res) => {
  const templateid = req.params.templateid;
  try {
    let templatesData = await employeeTemplateModel.find({ templateid: templateid }).exec();
    let componentsData = await employeeComponentModel.find({ templateid: templateid }).exec();
    let libraryTemplatesData = await libraryTemplatesModel.find({ templateid: templateid }).exec();

    res.send({
      status: 200,
      message: "success",
      templatesData: templatesData,
      componentsData: componentsData,
      libraryTemplatesData: libraryTemplatesData
    })
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

//UPDATE GENERATE DOCUMENT SERIAL NO
const generatedDocumentSerialNo = async (req, res) => {
  try {
    const user = await signUpModel.findByIdAndUpdate(
      req.params.id,
      { $inc: { generateddocumentserialno: 1 } },
      { new: true }
    );
    res.send({ status: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//GET GENERATED DOCUMENT SERIAL NO
const getGeneratedDocumentSerialNo = async (req, res) => {
  try {
    let data = await signUpModel.findById({ _id: req.params.id });
    res.send({ status: 200, serialNo: data.generateddocumentserialno });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//GET LIBRARY TEMPLATES
const getLibraryTemplates = async (req, res) => {
  try {
    const customTemplatesData = await libraryTemplatesModel.find({ userid: req.params.id });

    res.json({
      status: 200,
      message: 'success',
      customTemplatesData
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//DELETE CUSTOM TEMPLATE
const deleteCustomTemplate = (req,res) => {
  try {
    libraryTemplatesModel.findByIdAndDelete({_id: req.params.id},(err,data) => {
      if(data) {
        res.send({
          status: 200,
          message: 'Deleted'
        })
      }
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

//POST USER FEEDBACK
const postUserFeedback = async (req,res) => {
  try {
    let newFeedback = new userFeedbackModel({
      username: req.body.userName,
      userid: req.body.userId,
      useremail: req.body.userEmail,
      starrating: req.body.starRating,
      category: req.body.category,
      feedback: req.body.userData.userFeedback,
      createdat: new Date()
    })
    await newFeedback.save();
    
    res.send({
      status: 200,
      message: 'Thankyou for your valuable feedback'
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

//GET USERFEEDBACKS
const getUserFeedback = async (req,res) => {
  try {
    let userFeedback = await userFeedbackModel.find();
    res.send({
      status: 200,
      message: 'success',
      data: userFeedback
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

//UPDATE USER FEEDBACK
const updateUserFeedback = async (req, res) => {
  try {
    const updatedFeedback = {
      feedback: req.body.userData.userFeedback,
      starrating: req.body.starRating,
      category: req.body.category,
      modifiedat: new Date()
    };
    const feedback = await userFeedbackModel.findByIdAndUpdate(
      { _id: req.body.id },
      { $set: updatedFeedback },
      { new: true }
    );
    if (feedback) {
      res.send({
        status: 200,
        message: 'Updated'
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

//DELETE USER FEEDBACK
const deleteUserFeedback = (req,res) => {
  try {
    userFeedbackModel.findByIdAndDelete({_id: req.params.id},(err,data) => {
      if(data) {
        res.send({
          status: 200,
          message: 'Deleted'
        })
      }
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

//POST CREATE DEFAULT TEMPLATE
const createDefaultLibraryTemplate = async (req,res) => {
  try {
    let defaultLibraryTemplate = new libraryTemplatesModel({   
      templatetype: req.body.templatetype,
      category: req.body.category,
      html: req.body.html,
      created_by: req.body.created_by,
      createdat: new Date(),
    })
    await defaultLibraryTemplate.save();
    res.send({status: 200, message: 'Template added to library'})
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// POST CREATE GLOBAL TEMPLATE
const createGlobalTemplate = async (req,res) => {
  try {
    const globalTemplate = new globalTemplateModel({
      userid: req.params.id,
      templatename: req.body.templatename,
      description: req.body.description,
      templatetype: req.body.templatetype,
      html: req.body.html,
      createdat: new Date()
    })
    await globalTemplate.save();

    res.send({ status: 200, message: "Global template created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// GET GLOBAL TEMPLATES
const getGlobalTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 5, searchedKeyword, sortBy } = req.query;
    const size = parseInt(limit);
    const skip = Math.max(page - 1, 0) * size;
    const userid = req.params.id;

    const templateDataQuery = { userid };

    let totalDataCountQuery = { userid };

    if (searchedKeyword) {
      const regex = new RegExp(searchedKeyword, 'i');
      templateDataQuery.templatename = regex;
      totalDataCountQuery.templatename = regex;
    }

    let templateDataSort = {};
    if (sortBy) {
      if (sortBy === "Name") {
        templateDataSort.templatename = 1;
      } else if (sortBy === "Last Updated") {
        templateDataSort.modifiedat = -1;
      }
    }

    const [globalTemplates, totalDataCount] = await Promise.all([
      globalTemplateModel
        .find(templateDataQuery)
        .sort(templateDataSort)
        .collation({ locale: 'en', strength: 2 })
        .limit(size)
        .skip(skip),
      globalTemplateModel.countDocuments(totalDataCountQuery),
    ]);

    res.json({
      status: 200,
      message: 'success',
      userSpecificTemplates: globalTemplates,
      totalData: totalDataCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};  

// GET GET GLOBAL TEMPLATE WHILE SCROLL
const getGlobalTemplatesWhileScroll = async ({ query: { page = 1, limit = 5 }, params: { id } }, res) => {
  try {
    const size = parseInt(limit);
    const skip = Math.max(page - 1, 0) * size;

    const globalTemplatesData = await globalTemplateModel.find({userid: id})
    .limit(size)
    .skip(skip);
    res.status(200).send({ globalTemplatesData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PUT UPDATE GLOBAL TEMPLATE
const updateGlobalTemplate = (req,res) => {
  try {
    globalTemplateModel.findByIdAndUpdate({_id: req.params.id},
      {
        $set: {
          templatename: req.body.templatename,
          description: req.body.description,
          templatetype: req.body.templatetype,
          html: req.body.html,
          modifiedat: new Date()
        }
      }).then(data => {
        if(data) {
          res.send({
            status: 200,
            message: 'Template updated'
          })
        }
      })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// DELETE GLOBAL TEMPLATE
const deleteGlobalTemplate = async (req, res) => {
  try {
    const deletedTemplate = await globalTemplateModel.findByIdAndDelete({ _id: req.params.id });

    if (deletedTemplate) {
      res.send({ status: 200, message: "Deleted" });
    } else {
      res.status(404).json({ message: "Template not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// POST CREATE NEW GLOBAL PLACEHOLDER TYPE
const createNewGlobalPlaceholderType = async (req,res) => {
  try {
    let newGlobalPlaceholderType = new globalPlaceholderTypeModel({
      userid: req.params.userid,
      templatetype: req.body.templatetype,
      createdat: new Date()
    })
    await newGlobalPlaceholderType.save();
    res.send({ status: 200, message: "Placeholder added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// GET check global template name exist 
const checkGlobalTemplateNameExist = async (req,res) => {
  try {
    const userid = req.params.userid;
    const templateNameToCheck = req.params.checkTemplateName;

    const existingGlobalTemplates = await globalTemplateModel.findOne({
      userid: { $in: userid },
      templatename: templateNameToCheck
    });

    if (existingGlobalTemplates) {
      res.send({
        status: 400,
        message: 'Template name already exists. Please use a different name.'
      });
    } else {
      res.send({status: 200})
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// GET GLOBAL PLACEHOLDER TYPES
const getGlobalPlaceholderTypes = async (req, res) => {
  try {
    const { userid } = req.params;
    const userAddedPlaceholderTypes = await globalPlaceholderTypeModel.find({ userid: userid }).lean();

    res.send({
      status: 200,
      userAddedPlaceholderTypes
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// DELETE GLOBAL PLACEHOLDER TYPE
const deleteGlobalPlaceholderType = async (req, res) => {
  try {
    const deletedPlaceholderType = await globalPlaceholderTypeModel.findByIdAndDelete({_id: req.params.id});
    if(deletedPlaceholderType) {
      res.send({ status: 200, message: "Deleted" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// POST SAVE GENERATED DOCUMENTS
const saveGeneratedDocument = async (req,res) => {
  try {
    const generateDocument = new generatedDocumentModel({
      userid: req.body.userid,
      generateddocumentid: req.body.generateddocumentid,
      templatetype: req.body.templatetype,
      generateddocument: req.body.generateddocument,
      generatedat: new Date()
    })
    await generateDocument.save();

    res.send({ status: 200 })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// GET GENERATED DOCUMENTS
const getGeneratedDocuments = async (req, res) => {
  try {
    let { page = 1, limit = 5, searchedKeyword, sortBy } = req.query;

    const size = parseInt(limit);
    const skip = Math.max(page - 1, 0) * size;    

    const userid = req.params.userid;
    const templateDataQuery = { userid };
    const totalDataCountQuery = { userid };

    if (searchedKeyword) {
      templateDataQuery.templatetype = { $regex: searchedKeyword, $options: "i" };
      totalDataCountQuery.templatetype = { $regex: searchedKeyword, $options: "i" };
    }

    if (sortBy) {
      if (sortBy === 'Custom Type') {
        templateDataQuery.templatetype = {
          $nin: ["Based On Offer", "Based On Total Compensation", "Based On Salary Slip"]
        }
      } else {
        templateDataQuery.templatetype = new RegExp(sortBy, 'i');
      }
    }        
    
    const globalTemplates = await generatedDocumentModel
      .find(templateDataQuery)
      .collation({ locale: 'en', strength: 2 })
      .limit(size)
      .skip(skip);

    const totalDataCount = await generatedDocumentModel.countDocuments(totalDataCountQuery);

    res.send({
      status: 200,
      data: globalTemplates,
      totalDataCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// POST Upload user profile
const uploadUserProfile = async (req, res) => {
  try {
    const id = req.params.userid;
    const base64Img = req.body.base64;

    await signUpModel.findByIdAndUpdate({ _id: id }, { base64img: base64Img });

    res.send({status: 200, message: 'Profile uploaded'})
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//GET user profile
const getUserProfile = async (req, res) => {
  try {
    const { userid } = req.params;
    const data = await signUpModel.findById(userid);
    const image = data.base64img;
    res.status(200).json({ image: image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  createEmployeeTemplate,
  getEmployeeTemplates,
  updateEmployeeTemplate,
  deleteEmployeeTemplate,
  templateStatusChange,
  deleteEmployeeComponent,
  deleteEmployeeRelatedComponent,
  sendInvoiceThroughEmail,
  getTemplatesType,
  addNewTemplateType,
  deleteAddedTemplateType,
  checkTemplateNameExist,
  getEmployeeTemplatesWhileScroll,
  generatedDocumentSerialNo,
  getGeneratedDocumentSerialNo,
  getLibraryTemplates,
  deleteCustomTemplate,
  postUserFeedback,
  getUserFeedback,
  updateUserFeedback,
  deleteUserFeedback,
  createDefaultLibraryTemplate,
  createGlobalTemplate,
  getGlobalTemplates,
  updateGlobalTemplate,
  deleteGlobalTemplate,
  createNewGlobalPlaceholderType,
  getGlobalPlaceholderTypes,
  deleteGlobalPlaceholderType,
  getGlobalTemplatesWhileScroll,
  checkGlobalTemplateNameExist,
  verifyTemplate,
  saveGeneratedDocument,
  getGeneratedDocuments,
  uploadUserProfile,
  getUserProfile
};
