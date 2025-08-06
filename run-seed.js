require("dotenv").config({ path: ".env.local" });

const { exec } = require("child_process");

console.log("🔄 Carregando variáveis de ambiente do .env.local...");
console.log(
  "DATABASE_URL:",
  process.env.DATABASE_URL ? "Carregada ✅" : "Não encontrada ❌",
);

exec("npx tsx src/db/seed.ts", (error, stdout, stderr) => {
  if (error) {
    console.error("❌ Erro:", error);
    return;
  }
  if (stderr) {
    console.error("⚠️  Stderr:", stderr);
  }
  console.log(stdout);
});
