import path from "path";
import PrivacyFilter from "./PrivacyFilter.ts";
import fs from "fs";

const data = JSON.parse(fs.readFileSync(path.join(__dirname, "player.json"), "utf-8"));
const filteredData = PrivacyFilter.filterQueryResponse(data);

fs.writeFileSync(path.join(__dirname, "player.json"), JSON.stringify(filteredData), "utf-8");
