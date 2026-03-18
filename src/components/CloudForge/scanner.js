// ─────────────────────────────────────────────────────────────────────────────
// CloudForge — Diagram Scanner Engine
// Checks system design rules, AWS best practices, and architecture flaws
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITY = { error: "error", warning: "warning", info: "info" };

// Helper: get all cloud node types from diagram
const getTypes   = (nodes) => nodes.filter((n) => n.type === "cloud").map((n) => n.data?.type);
const hasType    = (nodes, type) => getTypes(nodes).includes(type);
const countType  = (nodes, type) => getTypes(nodes).filter((t) => t === type).length;
const getNodes   = (nodes, type) => nodes.filter((n) => n.type === "cloud" && n.data?.type === type);
const connectedIds = (edges) => new Set([...edges.map((e) => e.source), ...edges.map((e) => e.target)]);

// ─────────────────────────────────────────────────────────────────────────────
// RULE DEFINITIONS
// Each rule returns null (pass) or an issue object { id, severity, title, detail, fix, affectedNodes }
// ─────────────────────────────────────────────────────────────────────────────

const RULES = [

  // ── Connectivity ────────────────────────────────────────────────────────────
  {
    id: "isolated-nodes",
    check(nodes, edges) {
      const connected = connectedIds(edges);
      const isolated  = nodes
        .filter((n) => n.type === "cloud" && !connected.has(n.id))
        .map((n) => n.data?.label || n.id);
      if (isolated.length === 0) return null;
      return {
        severity: SEVERITY.warning,
        title: `${isolated.length} isolated component${isolated.length > 1 ? "s" : ""}`,
        detail: `${isolated.join(", ")} ${isolated.length > 1 ? "are" : "is"} not connected to anything. Isolated components suggest an incomplete architecture.`,
        fix: "Connect these components to the rest of the diagram or remove them if unused.",
        affectedNodes: nodes.filter((n) => n.type === "cloud" && !connected.has(n.id)).map((n) => n.id),
      };
    },
  },

  {
    id: "empty-diagram",
    check(nodes, edges) {
      const cloudNodes = nodes.filter((n) => n.type === "cloud");
      if (cloudNodes.length > 0) return null;
      return {
        severity: SEVERITY.info,
        title: "No components placed",
        detail: "The canvas has no AWS or system components. Add components from the sidebar to start designing.",
        fix: "Drag at least one component from the sidebar onto the canvas.",
        affectedNodes: [],
      };
    },
  },

  {
    id: "no-edges",
    check(nodes, edges) {
      const cloudNodes = nodes.filter((n) => n.type === "cloud");
      if (cloudNodes.length < 2 || edges.length > 0) return null;
      return {
        severity: SEVERITY.warning,
        title: "No connections between components",
        detail: "You have multiple components but none are connected. Connections show how data flows through the system.",
        fix: "Use the Arrow tool to draw connections between components.",
        affectedNodes: [],
      };
    },
  },

  // ── High Availability ───────────────────────────────────────────────────────
  {
    id: "no-load-balancer",
    check(nodes, edges) {
      const ec2Count = countType(nodes, "ec2") + countType(nodes, "ecs") + countType(nodes, "fargate");
      const hasLB    = hasType(nodes, "loadBalancer");
      if (ec2Count < 2 || hasLB) return null;
      return {
        severity: SEVERITY.error,
        title: "Multiple compute instances without a Load Balancer",
        detail: `You have ${ec2Count} compute nodes but no Load Balancer. Without one, traffic cannot be distributed and you have no fault tolerance.`,
        fix: "Add an Application Load Balancer (ALB) in front of your compute layer.",
        affectedNodes: [...getNodes(nodes, "ec2"), ...getNodes(nodes, "ecs"), ...getNodes(nodes, "fargate")].map((n) => n.id),
      };
    },
  },

  {
    id: "single-db-no-replica",
    check(nodes, edges) {
      const dbs = ["rds", "aurora", "dynamodb"];
      for (const db of dbs) {
        if (countType(nodes, db) === 1) {
          return {
            severity: SEVERITY.warning,
            title: `Single ${db.toUpperCase()} instance — no redundancy`,
            detail: `A single database instance is a Single Point of Failure (SPOF). If it goes down, your entire application loses data access.`,
            fix: "Enable Multi-AZ deployment for RDS/Aurora, or add a read replica. DynamoDB is multi-region by default but consider Global Tables for DR.",
            affectedNodes: getNodes(nodes, db).map((n) => n.id),
          };
        }
      }
      return null;
    },
  },

  {
    id: "no-cache-layer",
    check(nodes, edges) {
      const hasDB      = ["rds", "aurora", "dynamodb", "documentdb"].some((t) => hasType(nodes, t));
      const hasCache   = hasType(nodes, "elasticache") || hasType(nodes, "memorydb") || hasType(nodes, "cache") || hasType(nodes, "redis");
      const hasHighCost = nodes.filter((n) => n.type === "cloud").reduce((s, n) => s + (n.data?.cost || 0), 0) > 100;
      if (!hasDB || hasCache || !hasHighCost) return null;
      return {
        severity: SEVERITY.info,
        title: "No caching layer in front of database",
        detail: "High-traffic architectures benefit significantly from a cache layer. Without it, every request hits the database directly, increasing latency and cost.",
        fix: "Add ElastiCache (Redis or Memcached) between your application and database to reduce load and improve response time.",
        affectedNodes: [],
      };
    },
  },

  // ── Security ────────────────────────────────────────────────────────────────
  {
    id: "no-vpc",
    check(nodes, edges) {
      const cloudNodes = nodes.filter((n) => n.type === "cloud");
      const hasPrivate = ["rds", "aurora", "elasticache", "ec2", "ecs", "eks"].some((t) => hasType(nodes, t));
      if (!hasPrivate || hasType(nodes, "vpc") || cloudNodes.length < 3) return null;
      return {
        severity: SEVERITY.error,
        title: "Private resources exposed without a VPC",
        detail: "Your architecture has databases and compute resources but no VPC. Without a VPC, all resources are on the public internet by default.",
        fix: "Wrap your private resources (databases, internal services) inside a VPC with private subnets. Place only your load balancer in the public subnet.",
        affectedNodes: [...getNodes(nodes, "rds"), ...getNodes(nodes, "ec2"), ...getNodes(nodes, "ecs")].map((n) => n.id),
      };
    },
  },

  {
    id: "no-waf",
    check(nodes, edges) {
      const hasPublicEntry = hasType(nodes, "apigateway") || hasType(nodes, "cloudfront") || hasType(nodes, "loadBalancer");
      const hasWAF         = hasType(nodes, "waf");
      const cloudNodes     = nodes.filter((n) => n.type === "cloud");
      if (!hasPublicEntry || hasWAF || cloudNodes.length < 4) return null;
      return {
        severity: SEVERITY.warning,
        title: "Public entry point without WAF protection",
        detail: "Your API Gateway, CloudFront, or Load Balancer is exposed to the internet without a Web Application Firewall. This leaves you vulnerable to SQL injection, XSS, and DDoS attacks.",
        fix: "Attach AWS WAF to your CloudFront distribution or ALB to filter malicious traffic.",
        affectedNodes: [...getNodes(nodes, "apigateway"), ...getNodes(nodes, "cloudfront"), ...getNodes(nodes, "loadBalancer")].map((n) => n.id),
      };
    },
  },

  {
    id: "no-iam",
    check(nodes, edges) {
      const cloudNodes = nodes.filter((n) => n.type === "cloud");
      if (cloudNodes.length < 4 || hasType(nodes, "iam") || hasType(nodes, "cognito")) return null;
      return {
        severity: SEVERITY.warning,
        title: "No identity or access management defined",
        detail: "A production architecture should have explicit IAM roles and policies to control which services can access which resources (principle of least privilege).",
        fix: "Add IAM to define service roles, or Cognito if your application has end-users that need to authenticate.",
        affectedNodes: [],
      };
    },
  },

  {
    id: "db-directly-connected-to-internet",
    check(nodes, edges) {
      const dbTypes   = ["rds", "aurora", "dynamodb", "documentdb", "elasticache", "memorydb"];
      const dbIds     = new Set(nodes.filter((n) => n.type === "cloud" && dbTypes.includes(n.data?.type)).map((n) => n.id));
      const clientIds = new Set(nodes.filter((n) => n.type === "cloud" && ["client", "browser", "mobile"].includes(n.data?.type)).map((n) => n.id));
      const directLinks = edges.filter((e) =>
        (dbIds.has(e.source) && clientIds.has(e.target)) ||
        (dbIds.has(e.target) && clientIds.has(e.source))
      );
      if (directLinks.length === 0) return null;
      return {
        severity: SEVERITY.error,
        title: "Database directly connected to client",
        detail: "A database is connected directly to a client or browser node. Databases should NEVER be accessible from the client layer. This exposes your data to the internet.",
        fix: "Add a backend API or service layer between the client and the database. The client should only talk to an API, never directly to a database.",
        affectedNodes: [...dbIds].filter((id) => edges.some((e) => (e.source === id && clientIds.has(e.target)) || (e.target === id && clientIds.has(e.source)))),
      };
    },
  },

  {
    id: "no-secrets-manager",
    check(nodes, edges) {
      const hasDB    = ["rds", "aurora", "documentdb"].some((t) => hasType(nodes, t));
      const hasSM    = hasType(nodes, "secretsmanager") || hasType(nodes, "kms");
      const cloudNodes = nodes.filter((n) => n.type === "cloud");
      if (!hasDB || hasSM || cloudNodes.length < 5) return null;
      return {
        severity: SEVERITY.info,
        title: "No secrets management for database credentials",
        detail: "Your architecture has a relational database but no Secrets Manager or KMS. Hardcoded credentials or environment variables are a common security vulnerability.",
        fix: "Use AWS Secrets Manager to store and rotate database credentials automatically.",
        affectedNodes: [],
      };
    },
  },

  // ── Scalability ─────────────────────────────────────────────────────────────
  {
    id: "no-cdn",
    check(nodes, edges) {
      const hasS3     = hasType(nodes, "s3") || hasType(nodes, "blob");
      const hasCDN    = hasType(nodes, "cloudfront") || hasType(nodes, "cdn");
      const hasClient = hasType(nodes, "client") || hasType(nodes, "mobile") || hasType(nodes, "browser");
      if (!hasS3 || hasCDN || !hasClient) return null;
      return {
        severity: SEVERITY.info,
        title: "Static assets served without a CDN",
        detail: "You have an S3 bucket serving content directly to clients. Without a CDN, every request travels to the origin server, causing higher latency for distant users.",
        fix: "Add CloudFront in front of your S3 bucket to cache and serve content from edge locations closer to your users.",
        affectedNodes: getNodes(nodes, "s3").map((n) => n.id),
      };
    },
  },

  {
    id: "no-queue-for-heavy-processing",
    check(nodes, edges) {
      const hasLambda  = hasType(nodes, "lambda");
      const hasHeavy   = hasType(nodes, "sagemaker") || hasType(nodes, "batch") || hasType(nodes, "rekognition");
      const hasQueue   = hasType(nodes, "sqs") || hasType(nodes, "kinesis") || hasType(nodes, "msk") || hasType(nodes, "queue_g") || hasType(nodes, "kafka");
      if (!hasHeavy || hasQueue) return null;
      return {
        severity: SEVERITY.warning,
        title: "Heavy processing without a message queue",
        detail: "You have compute-intensive services (ML, batch processing) invoked without a queue. Synchronous invocation causes timeouts, lost requests under load, and no retry logic.",
        fix: "Add SQS or Kinesis between your trigger and processing service to buffer requests, enable retries, and handle spikes gracefully.",
        affectedNodes: getNodes(nodes, "sagemaker").map((n) => n.id),
      };
    },
  },

  {
    id: "no-auto-scaling",
    check(nodes, edges) {
      const hasEC2    = countType(nodes, "ec2") === 1;
      const hasLB     = hasType(nodes, "loadBalancer");
      const hasASG    = hasType(nodes, "ec2_asg");
      if (!hasEC2 || !hasLB || hasASG) return null;
      return {
        severity: SEVERITY.warning,
        title: "EC2 instance behind Load Balancer without Auto Scaling",
        detail: "You have a single EC2 instance behind a load balancer but no Auto Scaling Group. During traffic spikes, a single instance will become overloaded with no way to scale.",
        fix: "Add an Auto Scaling Group to automatically launch additional EC2 instances when CPU or request count thresholds are exceeded.",
        affectedNodes: getNodes(nodes, "ec2").map((n) => n.id),
      };
    },
  },

  // ── Observability ───────────────────────────────────────────────────────────
  {
    id: "no-monitoring",
    check(nodes, edges) {
      const hasMonitoring = hasType(nodes, "cloudwatch") || hasType(nodes, "monitoring") || hasType(nodes, "xray");
      const cloudNodes    = nodes.filter((n) => n.type === "cloud");
      if (hasMonitoring || cloudNodes.length < 5) return null;
      return {
        severity: SEVERITY.warning,
        title: "No monitoring or observability layer",
        detail: "Your architecture has no monitoring defined. Without monitoring, you won't know when services go down, when latency spikes, or when errors occur in production.",
        fix: "Add CloudWatch for metrics and alarms, X-Ray for distributed tracing, and CloudTrail for audit logging.",
        affectedNodes: [],
      };
    },
  },

  {
    id: "no-logging",
    check(nodes, edges) {
      const hasLogging = hasType(nodes, "cloudtrail") || hasType(nodes, "cloudwatch");
      const cloudNodes = nodes.filter((n) => n.type === "cloud");
      if (hasLogging || cloudNodes.length < 6) return null;
      return {
        severity: SEVERITY.info,
        title: "No audit logging (CloudTrail)",
        detail: "CloudTrail is not in your architecture. Without it, you have no record of who made API calls, what resources were changed, or when security events occurred. This is a compliance requirement in many industries.",
        fix: "Enable AWS CloudTrail to record all API activity across your AWS account.",
        affectedNodes: [],
      };
    },
  },

  // ── Cost & Efficiency ───────────────────────────────────────────────────────
  {
    id: "expensive-architecture",
    check(nodes, edges) {
      const total = nodes.filter((n) => n.type === "cloud").reduce((s, n) => s + (n.data?.cost || 0), 0);
      if (total < 800) return null;
      return {
        severity: SEVERITY.info,
        title: `High estimated cost — $${total.toLocaleString()}/mo`,
        detail: `Your architecture's estimated cost is $${total.toLocaleString()} per month. For a startup or non-production environment, this may be excessive.`,
        fix: "Consider using serverless alternatives (Lambda instead of EC2, Aurora Serverless instead of RDS), Reserved Instances for steady-state workloads, or Spot Instances for batch jobs.",
        affectedNodes: [],
      };
    },
  },

  {
    id: "redundant-load-balancers",
    check(nodes, edges) {
      const count = countType(nodes, "loadBalancer");
      if (count < 3) return null;
      return {
        severity: SEVERITY.warning,
        title: `${count} Load Balancers — possible over-engineering`,
        detail: `You have ${count} Load Balancers. Unless this is a multi-tier architecture with separate public and internal ALBs, this may be unnecessarily complex and costly.`,
        fix: "Use one external ALB for public traffic and one internal ALB for service-to-service traffic. Consolidate where possible.",
        affectedNodes: getNodes(nodes, "loadBalancer").map((n) => n.id),
      };
    },
  },

  {
    id: "lambda-with-large-db",
    check(nodes, edges) {
      const hasLambda  = hasType(nodes, "lambda");
      const hasRDS     = hasType(nodes, "rds") || hasType(nodes, "aurora");
      const lambdaEdges = edges.filter((e) => {
        const lIds = new Set(getNodes(nodes, "lambda").map((n) => n.id));
        const dIds = new Set([...getNodes(nodes, "rds"), ...getNodes(nodes, "aurora")].map((n) => n.id));
        return (lIds.has(e.source) && dIds.has(e.target)) || (lIds.has(e.target) && dIds.has(e.source));
      });
      if (!hasLambda || !hasRDS || lambdaEdges.length === 0) return null;
      return {
        severity: SEVERITY.warning,
        title: "Lambda directly connected to RDS — connection pool risk",
        detail: "Lambda functions connected directly to RDS can exhaust database connection pools under load. Each Lambda invocation opens a new connection, and at scale (thousands of concurrent invocations), this will crash your database.",
        fix: "Add RDS Proxy between Lambda and RDS to pool and reuse database connections. Alternatively, consider DynamoDB for Lambda-backed workloads.",
        affectedNodes: [...getNodes(nodes, "lambda"), ...getNodes(nodes, "rds")].map((n) => n.id),
      };
    },
  },

  // ── Architecture Patterns ───────────────────────────────────────────────────
  {
    id: "api-without-auth",
    check(nodes, edges) {
      const hasAPI  = hasType(nodes, "apigateway") || hasType(nodes, "graphql") || hasType(nodes, "grpc");
      const hasAuth = hasType(nodes, "cognito") || hasType(nodes, "iam") || hasType(nodes, "auth");
      const cloudNodes = nodes.filter((n) => n.type === "cloud");
      if (!hasAPI || hasAuth || cloudNodes.length < 3) return null;
      return {
        severity: SEVERITY.error,
        title: "API Gateway with no authentication layer",
        detail: "Your API Gateway or GraphQL endpoint has no authentication defined. An unauthenticated API is publicly accessible to anyone on the internet.",
        fix: "Add AWS Cognito for user authentication, or configure IAM authorization on your API Gateway. Use JWT authorizers for third-party auth providers.",
        affectedNodes: [...getNodes(nodes, "apigateway"), ...getNodes(nodes, "graphql")].map((n) => n.id),
      };
    },
  },

  {
    id: "no-backup-strategy",
    check(nodes, edges) {
      const hasCriticalDB = ["rds", "aurora", "dynamodb"].some((t) => hasType(nodes, t));
      const hasBackup     = hasType(nodes, "s3") || hasType(nodes, "glacier");
      const cloudNodes    = nodes.filter((n) => n.type === "cloud");
      if (!hasCriticalDB || hasBackup || cloudNodes.length < 5) return null;
      return {
        severity: SEVERITY.info,
        title: "No backup or disaster recovery storage",
        detail: "Your architecture has a primary database but no visible backup strategy. Data loss from accidental deletion, corruption, or regional outages can be catastrophic.",
        fix: "Add automated RDS snapshots to S3 Glacier, enable DynamoDB point-in-time recovery, or set up AWS Backup for centralized backup management.",
        affectedNodes: [],
      };
    },
  },

  {
    id: "missing-dns",
    check(nodes, edges) {
      const hasPublicEntry = hasType(nodes, "cloudfront") || hasType(nodes, "loadBalancer") || hasType(nodes, "apigateway");
      const hasDNS         = hasType(nodes, "route53") || hasType(nodes, "dns");
      const cloudNodes     = nodes.filter((n) => n.type === "cloud");
      if (!hasPublicEntry || hasDNS || cloudNodes.length < 4) return null;
      return {
        severity: SEVERITY.info,
        title: "Public entry point without DNS routing",
        detail: "You have a public-facing service but no DNS defined. Users access services via DNS names, not raw IP addresses or AWS endpoints.",
        fix: "Add Route 53 to manage your domain and route traffic to CloudFront, ALB, or API Gateway. Use health checks for automatic failover.",
        affectedNodes: [],
      };
    },
  },

  {
    id: "circular-dependency",
    check(nodes, edges) {
      // Simple cycle detection: find any node that has edges both to and from the same node
      const circular = [];
      for (const e1 of edges) {
        const reverse = edges.find((e2) => e2.source === e1.target && e2.target === e1.source);
        if (reverse) {
          const n1 = nodes.find((n) => n.id === e1.source);
          const n2 = nodes.find((n) => n.id === e1.target);
          const label = `${n1?.data?.label || e1.source} ↔ ${n2?.data?.label || e1.target}`;
          if (!circular.includes(label)) circular.push(label);
        }
      }
      if (circular.length === 0) return null;
      return {
        severity: SEVERITY.warning,
        title: `Circular dependency detected (${circular.length})`,
        detail: `Bidirectional connections found: ${circular.join("; ")}. Circular dependencies make systems harder to understand, test, and scale independently.`,
        fix: "Break circular dependencies by introducing an event bus or message queue between the services, or re-evaluate the direction of data flow.",
        affectedNodes: [],
      };
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCAN FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

export function scanDiagram(nodes, edges) {
  const issues = [];

  for (const rule of RULES) {
    try {
      const result = rule.check(nodes, edges);
      if (result) {
        issues.push({ id: rule.id, ...result });
      }
    } catch (err) {
      console.warn(`Scanner rule "${rule.id}" threw:`, err);
    }
  }

  // Sort: errors first, then warnings, then info
  const order = { error: 0, warning: 1, info: 2 };
  issues.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    issues,
    summary: {
      total:    issues.length,
      errors:   issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      info:     issues.filter((i) => i.severity === "info").length,
      passed:   RULES.length - issues.length,
      score:    Math.max(0, Math.round(100 - issues.filter((i) => i.severity === "error").length * 20 - issues.filter((i) => i.severity === "warning").length * 8 - issues.filter((i) => i.severity === "info").length * 3)),
    },
  };
}