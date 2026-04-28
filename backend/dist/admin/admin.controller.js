"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_guard_1 = require("../auth/admin.guard");
const auth_guard_1 = require("../auth/auth.guard");
const admin_service_1 = require("./admin.service");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    getOverview(_request) {
        return this.adminService.getOverview();
    }
    getMonthlyTrend(_request, months) {
        const parsedMonths = Number(months);
        return this.adminService.getMonthlyTrend(Number.isFinite(parsedMonths) && parsedMonths > 0 ? parsedMonths : 7);
    }
    getUserGrowth(_request, months) {
        const parsedMonths = Number(months);
        return this.adminService.getUserGrowthTrend(Number.isFinite(parsedMonths) && parsedMonths > 0 ? parsedMonths : 7);
    }
    getUsersWithStats(_request) {
        return this.adminService.getUsersWithStats();
    }
    getMonthlySummary(_request, year, month) {
        return this.adminService.getMonthlySummary(Number(year), Number(month));
    }
    getTransactionsForMonth(_request, year, month) {
        return this.adminService.getTransactionsForMonth(Number(year), Number(month));
    }
    getCategoryBreakdown(_request, year, month) {
        return this.adminService.getCategoryBreakdownForMonth(Number(year), Number(month));
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('overview'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('monthly-trend'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getMonthlyTrend", null);
__decorate([
    (0, common_1.Get)('user-growth'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUserGrowth", null);
__decorate([
    (0, common_1.Get)('users-with-stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsersWithStats", null);
__decorate([
    (0, common_1.Get)('monthly-summary'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getMonthlySummary", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getTransactionsForMonth", null);
__decorate([
    (0, common_1.Get)('category-breakdown'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getCategoryBreakdown", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map