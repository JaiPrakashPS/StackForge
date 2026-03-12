export const COMPONENTS = [
  { type: "loadBalancer",  label: "Load Balancer",  icon: "⚖️",  color: "#3b82f6", category: "Network",   cost: 18  },
  { type: "ec2",           label: "EC2 Instance",   icon: "🖥️",  color: "#8b5cf6", category: "Compute",   cost: 35  },
  { type: "rds",           label: "RDS Database",   icon: "🗄️",  color: "#10b981", category: "Database",  cost: 120 },
  { type: "s3",            label: "S3 Bucket",      icon: "🪣",  color: "#f59e0b", category: "Storage",   cost: 5   },
  { type: "lambda",        label: "Lambda",         icon: "λ",   color: "#ef4444", category: "Compute",   cost: 2   },
  { type: "cloudfront",   label: "CloudFront CDN", icon: "🌐",  color: "#06b6d4", category: "Network",   cost: 10  },
  { type: "vpc",           label: "VPC",            icon: "🔒",  color: "#6366f1", category: "Network",   cost: 0   },
  { type: "elasticache",  label: "ElastiCache",    icon: "⚡",  color: "#f97316", category: "Database",  cost: 65  },
  { type: "sqs",           label: "SQS Queue",      icon: "📨",  color: "#84cc16", category: "Messaging", cost: 1   },
  { type: "apigateway",   label: "API Gateway",    icon: "🔌",  color: "#ec4899", category: "Network",   cost: 15  },
  { type: "eks",           label: "EKS Cluster",    icon: "⎈",   color: "#a78bfa", category: "Compute",   cost: 144 },
  { type: "dynamodb",      label: "DynamoDB",       icon: "🔷",  color: "#34d399", category: "Database",  cost: 25  },
];

export const COLOR_MAP = Object.fromEntries(COMPONENTS.map((c) => [c.type, c.color]));
export const COST_MAP  = Object.fromEntries(COMPONENTS.map((c) => [c.type, c.cost]));
export const INFO_MAP  = Object.fromEntries(COMPONENTS.map((c) => [c.type, c]));