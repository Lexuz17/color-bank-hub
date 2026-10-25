import { seedDevUsers } from "./dev-users.js";

async function main() {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    await seedDevUsers();
  } else {
    console.log("NODE_ENV is not development, development users were skipped");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
