import "dotenv/config";
import app from "./src/app.js";

const PORT = Number(process.env.PORT || 5001);

app.listen(PORT, () => {
  console.log(
    `Smart Knowledge Assistant API running at http://localhost:${PORT}`
  );
});