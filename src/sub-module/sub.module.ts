import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@miup/nest-config";
import { AliCloudSmsModule, AliCloudSmsService } from "@miup/nest-ali-sms";


@Module({
  imports: [AliCloudSmsModule]
})
export class SubModule {
  private logger: Logger = new Logger();
  constructor(private config: ConfigService, private sms: AliCloudSmsService) {
    this.logger.debug("-----");
    this.logger.debug("-----");
  }
}