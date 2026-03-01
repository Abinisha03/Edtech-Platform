
const { ConvexHttpClient } = require("convex/browser");
const { api } = require("./convex/_generated/api");
// require("dotenv").config({ path: ".env.local" });

const CONVEX_URL = "https://dapper-dinosaur-988.convex.cloud";

const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
    const id = "jx741rarcwp5p4dqvxc604vq3981ddfq";
    console.log("Checking assignment:", id);
    try {
        // @ts-ignore
        const assignment = await client.query(api.assignments.debugGetAssignment, { id });
        console.log("Assignment:", JSON.stringify(assignment, null, 2));
    } catch (e) {
        console.error("Error checking assignment:");
        console.error(e);
        if (e.data) console.error("Error data:", JSON.stringify(e.data, null, 2));
    }
}

main();
