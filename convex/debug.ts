
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export const checkAssignment = async (ctx: any, args: any) => {
    const id = "jx741rarcwp5p4dqvxc604vq3981ddfq" as Id<"assignments">;
    const assignment = await ctx.db.get(id);
    console.log("Assignment:", assignment);
    if (assignment) {
        console.log("Files:", assignment.files);
    } else {
        console.log("Assignment not found");
    }
    return assignment;
};
