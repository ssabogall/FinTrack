"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const corsOrigins = process.env.CORS_ORIGIN?.split(',').map((s) => s.trim());
    app.enableCors({
        origin: corsOrigins?.length
            ? corsOrigins
            : ['http://localhost:5173', 'http://localhost', 'http://127.0.0.1'],
    });
    app.setGlobalPrefix('api');
    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
//# sourceMappingURL=main.js.map