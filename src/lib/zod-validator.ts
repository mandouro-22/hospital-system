import { validator } from "hono/validator";
import type { Env, MiddlewareHandler, ValidationTargets } from "hono";
import type { z } from "zod";
import { zodValidationHook } from "@/lib/validation-hook";

export function zodValidator<
  Target extends keyof ValidationTargets,
  Schema extends z.ZodType,
  E extends Env = Env,
>(target: Target, schema: Schema): MiddlewareHandler<E, string, {
  in: { [K in Target]: z.input<Schema> };
  out: { [K in Target]: z.output<Schema> };
}> {
  return validator(target, async (value, c) => {
    const result = await schema.safeParseAsync(value);

    if (result.success) {
      return result.data;
    }

    const hookResult = await zodValidationHook({ success: false, error: result.error }, c);
    if (hookResult) {
      return hookResult;
    }

    return c.json(result.error.flatten(), 400);
  }) as MiddlewareHandler<E, string, {
    in: { [K in Target]: z.input<Schema> };
    out: { [K in Target]: z.output<Schema> };
  }>;
}
