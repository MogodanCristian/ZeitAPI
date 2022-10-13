//validation

const Joi = require('@hapi/joi');

//register validation
const registerValidation = (data) => {
    const schema = Joi.object({
        first_name: Joi.string().required().min(6).max(255),
        last_name: Joi.string().required().min(6).max(255),
        email: Joi.string().required().email(),
        password: Joi.string().min(8).required(),
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
        manager_id: Joi.required()
    });
    return schema.validate(data);
}

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.projectValidation = projectValidation;