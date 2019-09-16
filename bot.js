import {config as DotEnvConfig} from "dotenv";

import DiscordBot from "./framework/DiscordBot";

DotEnvConfig();
const bot = new DiscordBot(process.env.DISCORD_TOKEN).run();