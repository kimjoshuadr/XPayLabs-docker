# XPay Labs（xpay）商家管理后台 — Vue 3 加密支付网关管理面板

[English](README.md) | **中文**

**XPay Labs（xpay）商家管理后台**是 [XPay Labs](https://www.xpaylabs.com) 自托管加密支付网关的商户端管理面板。基于 Vue 3 + Element Plus + TypeScript + Vite 6 构建，提供订单管理、资产管理、收款地址配置、结算处理等全套功能。

与 Java 后端和收银台页面共同组成完整的 XPay Labs 部署体系。

## 功能特性

- **订单管理** — 实时查看、筛选和管理收款及付款订单
- **资产看板** — 多链余额监控（TRON、EVM、SUI），资产总览
- **收款地址管理** — 每笔订单独立地址生成与生命周期追踪
- **付款处理** — 发起并追踪加密货币付款到外部地址
- **结算控制** — 配置自动热转冷钱包归集
- **Webhook 日志** — 查看回调投递历史，支持重试控制
- **API 凭证管理** — 管理商户令牌（HMAC-SHA256 签名）
- **费率配置** — 平台运营者为每个商户设置独立费率结构
- **多语言** — 中文和英文界面
- **权限控制** — 基于动态路由和按钮级指令的细粒度权限

## 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | Vue 3.5 + TypeScript |
| **UI 库** | Element Plus 2.9 |
| **构建工具** | Vite 6 + UnoCSS |
| **状态管理** | Pinia 3 |
| **路由** | Vue Router（后端返回动态路由） |
| **国际化** | vue-i18n（中/英） |
| **API 通信** | Axios + RSA/AES 加密 |
| **区块链** | ethers、tronweb |

## 架构特点

- **动态路由**：路由非前端硬编码，登录后后端返回菜单树，前端通过 `import.meta.glob` 匹配懒加载组件
- **API 加密**：`VITE_APP_ENCRYPT=true` 时所有 POST/PUT 请求使用 AES 加密 + RSA 包装密钥
- **自动导入**：Vue/Pinia/ElementPlus API 自动注册，无需手动 `import`
- **权限指令**：按钮级权限通过 `v-hasPermi` / `v-hasRole` 自定义指令控制

## 快速开始

```bash
npm install
npm run dev              # Vite 开发服务器（代理到 :8078）
npm run build:prod       # 生产构建
npm run build:dev        # 开发构建
npm run lint:eslint      # ESLint 检查
npm run prettier         # Prettier 格式化
```

## 相关项目

- [XPay Labs 官网](https://github.com/yan253319066/XPayLabs-website)
- [Java 后端](https://github.com/yan253319066/XPayLabs-java)
- [收银台页面](https://github.com/yan253319066/XPayLabs-checkout)
- [Docker 部署](https://github.com/yan253319066/XPayLabs-docker)

## License

Copyright (C) 2026 XPay Labs

本程序为自由软件，遵循 [GNU General Public License v3.0](LICENSE)。
