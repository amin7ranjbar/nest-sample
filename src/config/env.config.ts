import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  PGADMIN_DEFAULT_EMAIL: Joi.string().required(),
  PGADMIN_DEFAULT_PASSWORD: Joi.string().required(),
  JWT_SECRET_KEY: Joi.string().required(),
  MAX_FILE_SIZE: Joi.number().required(),
  UPLOAD_LOCATION: Joi.string().required(),
  UPLOAD_URL: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_PASSWORD: Joi.string().required(),
  COMMANDER_USERNAME: Joi.string().required(),
  COMMANDER_PASSWORD: Joi.string().required(),
});
