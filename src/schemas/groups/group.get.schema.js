import z from "zod";

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
      .enum(["likeCount", "participantCount", "createdAt"])
      .optional()
      .default("createdAt"),
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
  try {
    if (Object.keys(req.query).length > 0) {
      req.validatedQuery = groupGetSchemas.query.parse(req.query);
    }
    if (Object.keys(req.params).length > 0) {
      req.validatedParams = groupGetSchemas.params.parse(req.params);
    }
    next(); // 다음 미들웨어 또는 라우터 핸들러로 진행
  } catch (error) {
    next(error); // 검증 실패 시 에러 핸들러로 전달
  }
};

export default groupGetValidation;
