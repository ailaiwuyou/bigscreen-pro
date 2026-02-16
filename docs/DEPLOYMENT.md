# BigScreen Pro - 部署运维指南

## 1. 部署架构

### 1.1 生产环境架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户访问层                               │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐         │
│  │   Web 浏览器   │  │   移动端     │  │   大屏展示   │         │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘         │
└──────────┼──────────────────┼──────────────────┼──────────────────┘
           │                  │                  │
           └──────────────────┼──────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────────┐
│                      接入层  │                                      │
│  ┌───────────────────────────┼──────────────────────────────────┐ │
│  │                   CDN (内容分发网络)                           │ │
│  │  • 静态资源加速 (JS/CSS/图片/字体)                            │ │
│  │  • 全球节点覆盖                                              │ │
│  │  • 智能路由 + 边缘缓存                                        │ │
│  └───────────────────────────┬──────────────────────────────────┘ │
│                              │                                      │
│  ┌───────────────────────────┼──────────────────────────────────┐ │
│  │                WAF (Web 应用防火墙)                             │ │
│  │  • DDoS 防护                                               │ │
│  │  • SQL 注入防护                                             │ │
│  │  • XSS 攻击防护                                             │ │
│  │  • Bot 管理                                                 │ │
│  │  • IP 黑白名单                                              │ │
│  └───────────────────────────┬──────────────────────────────────┘ │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────────┐
│                      网关层  │                                        │
│  ┌───────────────────────────┼────────────────────────────────────┐ │
│  │              Nginx / API Gateway                               │ │
│  │                                                                │ │
│  │  功能:                                                         │ │
│  │  ├── 反向代理                                                  │ │
│  │  ├── 负载均衡 (轮询/权重/最少连接)                              │ │
│  │  ├── SSL/TLS 终止                                              │ │
│  │  ├── HTTP/2 支持                                               │ │
│  │  ├── Gzip/Brotli 压缩                                          │ │
│  │  ├── 静态资源缓存                                              │ │
│  │  ├── 限流 (Rate Limiting)                                       │ │
│  │  ├── 熔断 (Circuit Breaker)                                     │ │
│  │  └── 健康检查                                                  │ │
│  │                                                                │ │
│  │  配置示例:                                                     │ │
│  │  upstream backend {                                           │ │
│  │      server 10.0.1.10:3000 weight=5;                          │ │
│  │      server 10.0.1.11:3000 weight=5;                          │ │
│  │      server 10.0.1.12:3000 backup;                            │ │
│  │      keepalive 32;                                            │ │
│  │  }                                                            │ │
│  │                                                                │ │
│  │  server {                                                     │ │
│  │      listen 443 ssl http2;                                    │ │
│  │      server_name api.bigscreen-pro.com;                       │ │
│  │                                                                │ │
│  │      ssl_certificate /etc/nginx/ssl/cert.pem;                 │ │
│  │      ssl_certificate_key /etc/nginx/ssl/key.pem;              │ │
│  │      ssl_protocols TLSv1.2 TLSv1.3;                             │ │
│  │      ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:...;             │ │
│  │      ssl_prefer_server_ciphers off;                            │ │
│  │                                                                │ │
│  │      # Gzip 压缩                                                │ │
│  │      gzip on;                                                  │ │
│  │      gzip_vary on;                                              │ │
│  │      gzip_proxied any;                                          │ │
│  │      gzip_comp_level 6;                                         │ │
│  │      gzip_types text/plain text/css text/xml application/json   │ │
│  │               application/javascript application/rss+xml          │ │
│  │               application/atom+xml image/svg+xml;                  │ │
│  │                                                                │ │
│  │      # 限流                                                     │ │
│  │      limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;│ │
│  │      limit_req zone=api burst=20 nodelay;                       │ │
│  │                                                                │ │
│  │      # 静态资源                                                 │ │
│  │      location /static/ {                                       │ │
│  │          alias /var/www/static/;                                │ │
│  │          expires 1y;                                            │ │
│  │          add_header Cache-Control "public, immutable";          │ │
│  │          access_log off;                                        │ │
│  │      }                                                        │ │
│  │                                                                │ │
│  │      # API 代理                                               │ │
│  │      location /api/ {                                         │ │
│  │          proxy_pass http://backend;                           │ │
│  │          proxy_http_version 1.1;                              │ │
│  │          proxy_set_header Upgrade $http_upgrade;              │ │
│  │          proxy_set_header Connection "upgrade";               │ │
│  │          proxy_set_header Host $host;                         │ │
│  │          proxy_set_header X-Real-IP $remote_addr;             │ │
│  │          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;│ │
│  │          proxy_set_header X-Forwarded-Proto $scheme;          │ │
│  │                                                                │ │
│  │          proxy_connect_timeout 30s;                          │ │
│  │          proxy_send_timeout 30s;                               │ │
│  │          proxy_read_timeout 30s;                               │ │
│  │                                                                │ │
│  │          # 错误处理                                           │ │
│  │          proxy_intercept_errors on;                            │ │
│  │          error_page 500 502 503 504 /50x.html;                 │ │
│  │      }                                                        │ │
│  │                                                                │ │
│  │      # 健康检查                                               │ │
│  │      location /health {                                       │ │
│  │          access_log off;                                       │ │
│  │          return 200 "healthy\n";                               │ │
│  │          add_header Content-Type text/plain;                   │ │
│  │      }                                                        │ │
│  │  }                                                            │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

这个 Nginx 网关层配置展示了完整的反向代理和负载均衡设置。我注意到配置中已经包含了 SSL/TLS 终止、限流、健康检查等关键功能。如果需要更详细的配置说明或其他特定功能的实现，请告诉我。<|tool_calls_section_begin|><|tool_call_begin|>functions.exec:148<|tool_call_argument_begin|>{