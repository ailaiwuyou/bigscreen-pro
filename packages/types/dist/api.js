/**
 * API 类型定义
 */
/** API 错误代码 */
export var ApiErrorCode;
(function (ApiErrorCode) {
    // 通用错误 (1000-1999)
    ApiErrorCode["UNKNOWN_ERROR"] = "1000";
    ApiErrorCode["INVALID_REQUEST"] = "1001";
    ApiErrorCode["INVALID_PARAMS"] = "1002";
    ApiErrorCode["RESOURCE_NOT_FOUND"] = "1003";
    ApiErrorCode["RESOURCE_EXISTS"] = "1004";
    ApiErrorCode["RESOURCE_CONFLICT"] = "1005";
    ApiErrorCode["OPERATION_FAILED"] = "1006";
    // 认证授权错误 (2000-2999)
    ApiErrorCode["UNAUTHORIZED"] = "2000";
    ApiErrorCode["FORBIDDEN"] = "2001";
    ApiErrorCode["TOKEN_EXPIRED"] = "2002";
    ApiErrorCode["TOKEN_INVALID"] = "2003";
    ApiErrorCode["INSUFFICIENT_PERMISSIONS"] = "2004";
    // 数据错误 (3000-3999)
    ApiErrorCode["DATA_VALIDATION_FAILED"] = "3000";
    ApiErrorCode["DATA_INTEGRITY_ERROR"] = "3001";
    ApiErrorCode["DATA_CONFLICT"] = "3002";
    ApiErrorCode["DATA_NOT_FOUND"] = "3003";
    // 文件错误 (4000-4999)
    ApiErrorCode["FILE_UPLOAD_FAILED"] = "4000";
    ApiErrorCode["FILE_DOWNLOAD_FAILED"] = "4001";
    ApiErrorCode["FILE_NOT_FOUND"] = "4002";
    ApiErrorCode["FILE_TOO_LARGE"] = "4003";
    ApiErrorCode["FILE_TYPE_NOT_SUPPORTED"] = "4004";
    // 服务错误 (5000-5999)
    ApiErrorCode["SERVICE_UNAVAILABLE"] = "5000";
    ApiErrorCode["SERVICE_TIMEOUT"] = "5001";
    ApiErrorCode["SERVICE_BUSY"] = "5002";
    ApiErrorCode["EXTERNAL_SERVICE_ERROR"] = "5003";
    // 限流错误 (6000-6999)
    ApiErrorCode["RATE_LIMIT_EXCEEDED"] = "6000";
    ApiErrorCode["QUOTA_EXCEEDED"] = "6001";
    ApiErrorCode["CONCURRENT_LIMIT_EXCEEDED"] = "6002";
})(ApiErrorCode || (ApiErrorCode = {}));
//# sourceMappingURL=api.js.map