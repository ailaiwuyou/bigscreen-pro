/**
 * 请求验证中间件
 * 使用class-validator和class-transformer进行请求体验证
 */

import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { validationError } from '../utils/response';

/**
 * 验证选项
 */
interface ValidationOptions {
  skipMissingProperties?: boolean;
  whitelist?: boolean;
  forbidNonWhitelisted?: boolean;
  groups?: string[];
}

/**
 * 格式化验证错误
 */
const formatValidationErrors = (
  errors: ValidationError[]
): Array<{ field: string; message: string; value?: unknown }> => {
  const formatted: Array<{ field: string; message: string; value?: unknown }> = [];

  const processError = (error: ValidationError, parentPath = ''): void => {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;

    if (error.constraints) {
      Object.entries(error.constraints).forEach(([type, message]) => {
        formatted.push({
          field: path,
          message,
          value: error.value,
        });
      });
    }

    if (error.children && error.children.length > 0) {
      error.children.forEach((child) => processError(child, path));
    }
  };

  errors.forEach((error) => processError(error));
  return formatted;
};

/**
 * 请求体验证中间件
 * @param type DTO类
 * @param options 验证选项
 */
export const validateRequest = <T extends object>(
  type: new () => T,
  options: ValidationOptions = {}
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = plainToClass(type, req.body, {
        excludeExtraneousValues: true,
      });

      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: false,
        ...options,
      });

      if (errors.length > 0) {
        const formattedErrors = formatValidationErrors(errors);
        validationError(res, formattedErrors);
        return;
      }

      // 将验证后的DTO附加到请求对象
      (req as Record<string, unknown>).validatedBody = dto;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 查询参数验证中间件
 * @param type DTO类
 * @param options 验证选项
 */
export const validateQuery = <T extends object>(
  type: new () => T,
  options: ValidationOptions = {}
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = plainToClass(type, req.query);

      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: false,
        ...options,
      });

      if (errors.length > 0) {
        const formattedErrors = formatValidationErrors(errors);
        validationError(res, formattedErrors);
        return;
      }

      (req as Record<string, unknown>).validatedQuery = dto;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 路由参数验证中间件
 * @param paramName 参数名
 * @param validator 验证函数
 */
export const validateParam = (
  paramName: string,
  validator: (value: string) => boolean | Promise<boolean>
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const value = req.params[paramName];

      if (!value) {
        validationError(res, [
          { field: paramName, message: 'Parameter is required' },
        ]);
        return;
      }

      const isValid = await validator(value);

      if (!isValid) {
        validationError(res, [
          { field: paramName, message: `Invalid ${paramName} format` },
        ]);
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default {
  validateRequest,
  validateQuery,
  validateParam,
};
