// ─────────────────────────────────────────────────────────────────────────────
// CloudForge — Component Library
// 80+ AWS services + general system design components
// ─────────────────────────────────────────────────────────────────────────────

export const COMPONENTS = [

  // ── Compute ────────────────────────────────────────────────────────────────
  { type: "ec2",            label: "EC2 Instance",       icon: "🖥️",  color: "#8b5cf6", category: "Compute",   cost: 35  },
  { type: "lambda",         label: "Lambda",             icon: "λ",   color: "#a78bfa", category: "Compute",   cost: 2   },
  { type: "eks",            label: "EKS Cluster",        icon: "⎈",   color: "#7c3aed", category: "Compute",   cost: 144 },
  { type: "ecs",            label: "ECS Service",        icon: "🐳",  color: "#6d28d9", category: "Compute",   cost: 40  },
  { type: "fargate",        label: "Fargate",            icon: "🚀",  color: "#5b21b6", category: "Compute",   cost: 30  },
  { type: "ec2_asg",        label: "Auto Scaling Group", icon: "📈",  color: "#8b5cf6", category: "Compute",   cost: 0   },
  { type: "lightsail",      label: "Lightsail",          icon: "💡",  color: "#9333ea", category: "Compute",   cost: 10  },
  { type: "beanstalk",      label: "Elastic Beanstalk",  icon: "🌱",  color: "#7e22ce", category: "Compute",   cost: 20  },
  { type: "batch",          label: "AWS Batch",          icon: "⚙️",  color: "#6d28d9", category: "Compute",   cost: 15  },

  // ── Network ────────────────────────────────────────────────────────────────
  { type: "loadBalancer",   label: "Load Balancer",      icon: "⚖️",  color: "#3b82f6", category: "Network",   cost: 18  },
  { type: "cloudfront",     label: "CloudFront CDN",     icon: "🌐",  color: "#0ea5e9", category: "Network",   cost: 10  },
  { type: "vpc",            label: "VPC",                icon: "🔒",  color: "#2563eb", category: "Network",   cost: 0   },
  { type: "apigateway",     label: "API Gateway",        icon: "🔌",  color: "#06b6d4", category: "Network",   cost: 15  },
  { type: "route53",        label: "Route 53",           icon: "🗺️",  color: "#0284c7", category: "Network",   cost: 5   },
  { type: "directconnect",  label: "Direct Connect",     icon: "🔗",  color: "#0369a1", category: "Network",   cost: 200 },
  { type: "vpn",            label: "VPN Gateway",        icon: "🛡️",  color: "#1d4ed8", category: "Network",   cost: 36  },
  { type: "subnet",         label: "Subnet",             icon: "🕸️",  color: "#3b82f6", category: "Network",   cost: 0   },
  { type: "nat",            label: "NAT Gateway",        icon: "🔄",  color: "#2563eb", category: "Network",   cost: 32  },
  { type: "igw",            label: "Internet Gateway",   icon: "🌍",  color: "#0ea5e9", category: "Network",   cost: 0   },
  { type: "waf",            label: "WAF",                icon: "🛡",  color: "#1e40af", category: "Network",   cost: 25  },

  // ── Database ───────────────────────────────────────────────────────────────
  { type: "rds",            label: "RDS Database",       icon: "🗄️",  color: "#10b981", category: "Database",  cost: 120 },
  { type: "dynamodb",       label: "DynamoDB",           icon: "🔷",  color: "#34d399", category: "Database",  cost: 25  },
  { type: "elasticache",    label: "ElastiCache",        icon: "⚡",  color: "#059669", category: "Database",  cost: 65  },
  { type: "aurora",         label: "Aurora",             icon: "🌌",  color: "#047857", category: "Database",  cost: 180 },
  { type: "redshift",       label: "Redshift",           icon: "🔴",  color: "#065f46", category: "Database",  cost: 250 },
  { type: "documentdb",     label: "DocumentDB",         icon: "📄",  color: "#10b981", category: "Database",  cost: 200 },
  { type: "neptune",        label: "Neptune (Graph)",    icon: "🔵",  color: "#14b8a6", category: "Database",  cost: 150 },
  { type: "timestream",     label: "Timestream",         icon: "⏱️",  color: "#0d9488", category: "Database",  cost: 50  },
  { type: "memorydb",       label: "MemoryDB (Redis)",   icon: "🧠",  color: "#34d399", category: "Database",  cost: 80  },

  // ── Storage ────────────────────────────────────────────────────────────────
  { type: "s3",             label: "S3 Bucket",          icon: "🪣",  color: "#f59e0b", category: "Storage",   cost: 5   },
  { type: "ebs",            label: "EBS Volume",         icon: "💾",  color: "#d97706", category: "Storage",   cost: 20  },
  { type: "efs",            label: "EFS",                icon: "📂",  color: "#f59e0b", category: "Storage",   cost: 30  },
  { type: "glacier",        label: "S3 Glacier",         icon: "🧊",  color: "#b45309", category: "Storage",   cost: 1   },
  { type: "fsx",            label: "FSx",                icon: "🗃️",  color: "#92400e", category: "Storage",   cost: 60  },
  { type: "storagegateway", label: "Storage Gateway",    icon: "📡",  color: "#d97706", category: "Storage",   cost: 40  },

  // ── Messaging ──────────────────────────────────────────────────────────────
  { type: "sqs",            label: "SQS Queue",          icon: "📨",  color: "#84cc16", category: "Messaging", cost: 1   },
  { type: "sns",            label: "SNS Topic",          icon: "🔔",  color: "#65a30d", category: "Messaging", cost: 1   },
  { type: "eventbridge",    label: "EventBridge",        icon: "🔀",  color: "#4d7c0f", category: "Messaging", cost: 5   },
  { type: "kinesis",        label: "Kinesis Streams",    icon: "🌊",  color: "#a3e635", category: "Messaging", cost: 35  },
  { type: "msk",            label: "MSK (Kafka)",        icon: "📊",  color: "#84cc16", category: "Messaging", cost: 120 },
  { type: "ses",            label: "SES (Email)",        icon: "📧",  color: "#78716c", category: "Messaging", cost: 1   },
  { type: "mq",             label: "Amazon MQ",          icon: "📬",  color: "#65a30d", category: "Messaging", cost: 30  },

  // ── Security ───────────────────────────────────────────────────────────────
  { type: "iam",            label: "IAM",                icon: "👤",  color: "#ec4899", category: "Security",  cost: 0   },
  { type: "cognito",        label: "Cognito",            icon: "🔑",  color: "#db2777", category: "Security",  cost: 10  },
  { type: "kms",            label: "KMS",                icon: "🗝️",  color: "#be185d", category: "Security",  cost: 5   },
  { type: "secretsmanager", label: "Secrets Manager",    icon: "🔐",  color: "#9d174d", category: "Security",  cost: 5   },
  { type: "shield",         label: "AWS Shield",         icon: "🛡️",  color: "#ec4899", category: "Security",  cost: 30  },
  { type: "guardduty",      label: "GuardDuty",          icon: "👁️",  color: "#db2777", category: "Security",  cost: 15  },
  { type: "inspector",      label: "Inspector",          icon: "🔍",  color: "#be185d", category: "Security",  cost: 10  },
  { type: "acm",            label: "ACM (Certs)",        icon: "📜",  color: "#9d174d", category: "Security",  cost: 0   },

  // ── DevOps & Monitoring ────────────────────────────────────────────────────
  { type: "cloudwatch",     label: "CloudWatch",         icon: "📊",  color: "#f97316", category: "DevOps",    cost: 10  },
  { type: "cloudtrail",     label: "CloudTrail",         icon: "🗒️",  color: "#ea580c", category: "DevOps",    cost: 8   },
  { type: "codepipeline",   label: "CodePipeline",       icon: "🔁",  color: "#fb923c", category: "DevOps",    cost: 5   },
  { type: "codebuild",      label: "CodeBuild",          icon: "🔨",  color: "#f97316", category: "DevOps",    cost: 10  },
  { type: "codecommit",     label: "CodeCommit",         icon: "📝",  color: "#c2410c", category: "DevOps",    cost: 1   },
  { type: "xray",           label: "X-Ray Tracing",      icon: "🔬",  color: "#f97316", category: "DevOps",    cost: 5   },
  { type: "config",         label: "AWS Config",         icon: "⚙",   color: "#ea580c", category: "DevOps",    cost: 8   },

  // ── AI / ML ────────────────────────────────────────────────────────────────
  { type: "sagemaker",      label: "SageMaker",          icon: "🤖",  color: "#06b6d4", category: "AI/ML",     cost: 200 },
  { type: "bedrock",        label: "AWS Bedrock",        icon: "🧬",  color: "#0891b2", category: "AI/ML",     cost: 50  },
  { type: "rekognition",    label: "Rekognition",        icon: "👁",  color: "#0e7490", category: "AI/ML",     cost: 15  },
  { type: "comprehend",     label: "Comprehend (NLP)",   icon: "🧩",  color: "#06b6d4", category: "AI/ML",     cost: 10  },
  { type: "textract",       label: "Textract",           icon: "📖",  color: "#0284c7", category: "AI/ML",     cost: 15  },

  // ── System Design (Generic) ────────────────────────────────────────────────
  { type: "client",         label: "Client / Browser",   icon: "💻",  color: "#64748b", category: "System",    cost: 0   },
  { type: "mobile",         label: "Mobile App",         icon: "📱",  color: "#64748b", category: "System",    cost: 0   },
  { type: "server",         label: "Web Server",         icon: "🗂️",  color: "#475569", category: "System",    cost: 0   },
  { type: "microservice",   label: "Microservice",       icon: "🔧",  color: "#334155", category: "System",    cost: 0   },
  { type: "cache",          label: "Cache Layer",        icon: "⚡",  color: "#0891b2", category: "System",    cost: 0   },
  { type: "queue_g",        label: "Message Queue",      icon: "📬",  color: "#65a30d", category: "System",    cost: 0   },
  { type: "database_g",     label: "Database",           icon: "🗄",  color: "#059669", category: "System",    cost: 0   },
  { type: "cdn",            label: "CDN",                icon: "🌐",  color: "#0ea5e9", category: "System",    cost: 0   },
  { type: "firewall",       label: "Firewall",           icon: "🔥",  color: "#dc2626", category: "System",    cost: 0   },
  { type: "dns",            label: "DNS Server",         icon: "🌍",  color: "#2563eb", category: "System",    cost: 0   },
  { type: "proxy",          label: "Reverse Proxy",      icon: "🔀",  color: "#7c3aed", category: "System",    cost: 0   },
  { type: "kafka",          label: "Kafka",              icon: "📡",  color: "#84cc16", category: "System",    cost: 0   },
  { type: "redis",          label: "Redis",              icon: "🔴",  color: "#dc2626", category: "System",    cost: 0   },
  { type: "nginx",          label: "Nginx",              icon: "🟢",  color: "#16a34a", category: "System",    cost: 0   },
  { type: "docker",         label: "Docker",             icon: "🐳",  color: "#0ea5e9", category: "System",    cost: 0   },
  { type: "kubernetes",     label: "Kubernetes",         icon: "⎈",   color: "#3b82f6", category: "System",    cost: 0   },
  { type: "graphql",        label: "GraphQL API",        icon: "◈",   color: "#e535ab", category: "System",    cost: 0   },
  { type: "grpc",           label: "gRPC Service",       icon: "⚙",   color: "#6366f1", category: "System",    cost: 0   },
  { type: "elasticsearch",  label: "Elasticsearch",      icon: "🔍",  color: "#f59e0b", category: "System",    cost: 0   },
  { type: "monitoring",     label: "Monitoring",         icon: "📈",  color: "#f97316", category: "System",    cost: 0   },
  { type: "cicd",           label: "CI/CD Pipeline",     icon: "🔁",  color: "#8b5cf6", category: "System",    cost: 0   },
  { type: "git",            label: "Git Repository",     icon: "🌿",  color: "#f97316", category: "System",    cost: 0   },
  { type: "thirdparty",     label: "Third Party API",    icon: "🔗",  color: "#64748b", category: "System",    cost: 0   },
  { type: "user",           label: "User",               icon: "👤",  color: "#94a3b8", category: "System",    cost: 0   },
  { type: "browser",        label: "Web Browser",        icon: "🌐",  color: "#64748b", category: "System",    cost: 0   },
  { type: "iot",            label: "IoT Device",         icon: "📡",  color: "#0891b2", category: "System",    cost: 0   },
  { type: "blob",           label: "Blob Storage",       icon: "☁️",  color: "#0ea5e9", category: "System",    cost: 0   },
  { type: "webhook",        label: "Webhook",            icon: "🪝",  color: "#8b5cf6", category: "System",    cost: 0   },
  { type: "auth",           label: "Auth Service",       icon: "🔒",  color: "#ec4899", category: "System",    cost: 0   },
];

export const COLOR_MAP = Object.fromEntries(COMPONENTS.map((c) => [c.type, c.color]));
export const COST_MAP  = Object.fromEntries(COMPONENTS.map((c) => [c.type, c.cost]));
export const INFO_MAP  = Object.fromEntries(COMPONENTS.map((c) => [c.type, c]));