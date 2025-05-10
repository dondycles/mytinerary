import z from "zod";
import { activitySchema } from "../server/functions/acticvity";

export type ActivitySchema = z.infer<typeof activitySchema>;
