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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const admin_guard_1 = require("../auth/admin.guard");
const auth_guard_1 = require("../auth/auth.guard");
const create_user_dto_1 = require("./dtos/create-user-dto");
const update_user_dto_1 = require("./dtos/update-user-dto");
const user_service_1 = require("./user.service");
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async findAll() {
        const users = await this.userService.findAll();
        return users.map((user) => this.toSafeUser(user));
    }
    async findOne(id, request) {
        await this.assertAdminOrSelf(request, id);
        const user = await this.userService.findOne(id);
        return user ? this.toSafeUser(user) : null;
    }
    async create(createUserDto) {
        const user = await this.userService.create(createUserDto);
        return this.toSafeUser(user);
    }
    async update(id, updateUserDto, request) {
        const requester = await this.assertAdminOrSelf(request, id);
        if (updateUserDto.role !== undefined && requester.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can change user roles');
        }
        const user = await this.userService.update(id, updateUserDto);
        return this.toSafeUser(user);
    }
    async assertAdminOrSelf(request, resourceUserId) {
        const requesterId = request.user?.sub;
        if (!requesterId)
            throw new common_1.ForbiddenException('User context not found');
        const requester = await this.userService.findOne(requesterId);
        if (!requester)
            throw new common_1.ForbiddenException('Authenticated user not found');
        if (requester.role !== 'admin' && requester.id !== resourceUserId) {
            throw new common_1.ForbiddenException('You can only access your own user');
        }
        return requester;
    }
    toSafeUser(user) {
        const { password: _password, ...safeUser } = user;
        return safeUser;
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
exports.UserController = UserController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map