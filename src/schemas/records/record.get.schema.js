import z from "zod";
import createError from "http-errors";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1), // "2" → 2
  limit: z.coerce.number().int().min(1).max(100).default(10),
  order: z.enum(["asc", "desc"]).default("desc"),
  orderBy: z.enum(["createdAt", "time"]).default("createdAt"),
  search: z.string().trim().optional().default(""),
});

export function getValidation(req, res, next) {
  const result = querySchema.safeParse(req.query);

  if (result.success) {
    next();
  } else {
    return next(createError(400, "입력값이 유효하지 않습니다."));
  }
}
