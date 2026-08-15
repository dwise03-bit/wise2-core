import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
export declare class AppController {
    private readonly appService;
    private readonly prisma;
    constructor(appService: AppService, prisma: PrismaService);
    getHealth(): Promise<any>;
    getReady(): Promise<any>;
}
//# sourceMappingURL=app.controller.d.ts.map