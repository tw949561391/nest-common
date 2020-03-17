import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@miup/nest-config";
import { Log4jModule } from "@miup/nest-log4j";
import { OauthStoreService } from "./oauth/oauth.store";
import { OauthClient, OauthClientModule, OauthServerModule, OauthStoreInterface } from "@miup/nest-oauth";
import { LocalOauthModule } from "./oauth/local-oauth.module";
import { AliCloudSmsModule } from "@miup/nest-ali-sms";

@Module({
  imports: [
    Log4jModule.register({
      pkgName: "miup-common"
    }),
    ConfigModule.register({
      env: "develop"
    }),
    OauthServerModule.registerAsync({
      imports: [LocalOauthModule],
      useFactory: (oa: OauthStoreInterface, conf: ConfigService) => {
        return {
          oauthStore: oa,
          jwt: {
            secretOrPrivateKey: "123"
          }
        };
      },
      inject: [OauthStoreService, ConfigService]
    }),
    OauthClientModule.registerAsync({
      useFactory: (conf: ConfigService) => {
        return {
          jwt: {
            secretOrPrivateKey: "123"
          }
        };

      },
      inject: [ConfigService]
    }),
    AliCloudSmsModule.register({
      default: {
        accessKeyId: "sss",
        secretAccessKey: "sss"
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
