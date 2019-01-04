import * as dotenv from 'dotenv-extended';
import {ConfigOption} from "../index";
import * as path from 'path'
import {IDotenvExtendedOptions} from "dotenv-extended";

export class ConfigService {
    private readonly envConfig: { [key: string]: string };

    constructor(option: ConfigOption) {
        const defaultOption = new ConfigOption()
        option = Object.assign(defaultOption, option)
        const dotenvOp: IDotenvExtendedOptions = {
            encoding: option.encoding,
            silent: true,
            defaults: path.join(option.path, `${option.basename}.default.env`),
            errorOnMissing: false,
            errorOnExtra: false,
            includeProcessEnv: false,
            assignToProcessEnv: true,
            overrideProcessEnv: false
        }
        if (option.env) {
            dotenvOp.path = path.join(option.path, `${option.basename}.${option.env}.env`)
        }
        this.envConfig = dotenv.load(dotenvOp)
    }

    get(key: string): any {
        return this.envConfig[key];
    }

    getString(key: string): string {
        return this.get(key);
    }

    getBoolean(key: string): boolean {
        return Boolean(this.get(key))
    }

    getInt(key: string): number {
        return parseInt(this.get(key))
    }

    getFloat(key: string): number {
        return parseFloat(this.get(key))
    }

}

