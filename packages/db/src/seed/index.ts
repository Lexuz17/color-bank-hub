import { seedDevUsers } from "./dev-users";

async function main() {
  const isDevAuth =
    process.env.DEV_AUTH === "true" && process.env.NODE_ENV !== "production";

  if (isDevAuth) {
    await seedDevUsers();
  } else {
    console.log("DEV_AUTH tidak aktif, user dev dilewati");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
