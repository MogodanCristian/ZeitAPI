//validation

const Joi = require('@hapi/joi');
const {joiPasswordExtendCore} = require('joi-password');
const joiPassword  = Joi.extend(joiPasswordExtendCore);

//register validation
const registerValidation = (data) => {
    const schema = Joi.object({
        first_name: Joi.string().required().max(255),
        last_name: Joi.string().required().max(255),
        email: Joi.string().required().email(),
        password: joiPassword.string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(8)
        .required(),
        role: Joi.string()
    });
    return schema.validate(data);
}

//login validation
const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().min(8).required(),
    });
    return schema.validate(data);
}

//project validation
const projectValidation = (data) =>{
    const schema =Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        start_date: Joi.date().required(),
        end_date: Joi.date().required(),
    });
    return schema.validate(data);
}

const bucketValidation = (data) =>{
    const schema = Joi.object({
        title: Joi.string().required(),
    });
    return schema.validate(data);
}
const taskValidation = (data) =>{
    const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        priority: Joi.number().required(),
    }).options({ stripUnknown : true });
    return schema.validate(data);
}


const passwordValidation = (data) =>{
    const schema = Joi.object({
        password: joiPassword.string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(8)
    });
    return schema.validate(data);
}

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.projectValidation = projectValidation;
module.exports.bucketValidation = bucketValidation;
module.exports.taskValidation = taskValidation;
module.exports.passwordValidation = passwordValidation;