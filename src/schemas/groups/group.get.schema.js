import z from "zod";
import createError from "http-errors";

// 그룹 GET 요청에 대한 query와 params 검증 스키마 정의
const groupGetSchemas = {
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, "page는 숫자여야 합니다.")
      .optional()
      .default("1")
      .transform(Number) // 문자열 숫자를 Number 타입으로 변환
      .refine((val) => val >= 1, { message: "page는 1 이상이어야 합니다." }),
    limit: z
      .string()
      .regex(/^\d+$/, "limit는 숫자여야 합니다.")
      .optional()
      .default("10")
      .transform(Number) // 문자열 숫자를 Number 타입으로 변환
      .refine((val) => val >= 1 && val <= 10, {
        message: "limit는 1 이상 10 이하이어야 합니다.",
      }),

    order: z.enum(["asc", "desc"]).optional().default("desc"),
    orderBy: z
      .string()
      .optional()
      .default("createdAt")
      .refine(
        (val) => ["likeCount", "participantCount", "createdAt"].includes(val),
        {
          message:
            "The orderBy parameter must be one of the following values: ['likeCount', 'participantCount', 'createdAt'].",
        }
      ),
    search: z.string().optional().default(""),
  }),

  params: z.object({
    groupId: z
      .string()
      .regex(/^\d+$/, "groupId는 숫자여야 합니다.")
      .transform(Number) // params의 groupId를 숫자로 변환
      .refine((val) => val >= 1, { message: "groupId는 1 이상이어야 합니다." }),
  }),
};

//미들웨어 함수
const groupGetValidation = (req, res, next) => {
  const rawQuery = req.query ?? {};
  const rawParams = req.params ?? {};

  if (Object.keys(rawQuery).length > 0) {
    const queryResult = groupGetSchemas.query.safeParse(rawQuery);
    if (!queryResult.success) {
      const issue = queryResult.error.issues[0];
      const err = createError(400, issue.message);
      err.path = issue.path[0];
      return next(err);
    }
    req.validatedQuery = queryResult.data;
  }

  if (Object.keys(rawParams).length > 0) {
    const paramsResult = groupGetSchemas.params.safeParse(rawParams);
    if (!paramsResult.success) {
      const issue = paramsResult.error.issues[0];
      const err = createError(400, issue.message);
      err.path = issue.path[0];
      return next(err);
    }
    req.validatedParams = paramsResult.data;
  }

  next();
};

export default groupGetValidation;
