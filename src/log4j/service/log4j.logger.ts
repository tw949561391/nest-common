import {LoggerService} from '@nestjs/common';
import * as Log4js from 'log4js';
import * as Path from 'path';
import * as os from 'os'
import * as pkgReader from 'read-pkg'

export class Log4j implements LoggerService {
    private logInstanceDebug: Log4js.Logger;
    private logInstanceInfo: Log4js.Logger;
    private logInstanceWarning: Log4js.Logger;
    private logInstanceError: Log4js.Logger;

    constructor(options: { baseDir: string }) {
        pkgReader().then((pkg: any) => {
            const defaultOption = {baseDir: Path.join(os.homedir(), 'logs', pkg.name)}
            options = Object.assign(defaultOption, options)
            const defaultConfig = {
                    replaceConsole: true,
                    appenders: {
                        stdout: {type: 'stdout'},
                        debug: {
                            type: 'dateFile',
                            pattern: '.yyyy-MM-dd',
                            filename: Path.join(options.baseDir, 'debug.log')
                        },
                        error: {
                            type: 'dateFile',
                            pattern: '.yyyy-MM-dd',
                            filename: Path.join(options.baseDir, 'error.log')
                        },
                        info: {type: 'dateFile', pattern: '.yyyy-MM-dd', filename: Path.join(options.baseDir, 'info.log')},
                        warning: {
                            type: 'dateFile',
                            pattern: '.yyyy-MM-dd',
                            filename: Path.join(options.baseDir, 'warning.log')
                        },
                    },
                    categories: {
                        default: {appenders: ['stdout', 'debug'], level: 'debug'},
                        debug: {appenders: ['stdout', 'debug'], level: 'debug'},
                        error: {appenders: ['stdout', 'error'], level: 'error'},
                        info: {appenders: ['stdout', 'info'], level: 'info'},
                        warning: {appenders: ['stdout', 'warning'], level: 'warn'},
                    },
                }
            ;
            Log4js.configure(defaultConfig);
            this.logInstanceDebug = Log4js.getLogger('debug');
            this.logInstanceInfo = Log4js.getLogger('info');
            this.logInstanceWarning = Log4js.getLogger('warning');
            this.logInstanceError = Log4js.getLogger('error');
        });

    }

    error(message: any, trace?: string, context?: string): any {
        this.logInstanceError.error(message);
    }

    log(message: any, context?: string): any {
        this.info(message, context);
    }

    info(message: any, context?: string) {
        this.logInstanceInfo.info(message);
    }

    debug(message: any, context?: string) {
        this.logInstanceDebug.debug(message);
    }

    warn(message: any, context?: string): any {
        this.logInstanceWarning.warn(message);
    }
}
