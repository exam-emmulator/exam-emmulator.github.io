import type { QuestionBank } from '@/lib/types';

// Fetch question banks from the server API or static files
export async function fetchQuestionBanksFromServer(): Promise<QuestionBank[]> {
  try {
    // Try API first (for development with server)
    const apiResponse = await fetch('/api/question-banks');
    if (apiResponse.ok) {
      return await apiResponse.json();
    }
  } catch (error) {
    console.log('API not available, trying static files...');
  }
  
  // Fallback to static files (for GitHub Pages)
  try {
    const manifestResponse = await fetch('/bank/manifest.json');
    if (!manifestResponse.ok) {
      throw new Error('Failed to fetch manifest');
    }
    
    const manifest = await manifestResponse.json();
    const banks: QuestionBank[] = [];
    
    // Fetch each bank file
    for (const item of manifest) {
      try {
        const bankResponse = await fetch(`/bank/${item.file}`);
        if (bankResponse.ok) {
          const bank = await bankResponse.json();
          banks.push(bank);
        }
      } catch (err) {
        console.error(`Failed to load bank ${item.file}:`, err);
      }
    }
    
    return banks;
  } catch (error) {
    console.error('Error fetching question banks from static files:', error);
    return [];
  }
}

export const sampleQuestionBanks: QuestionBank[] = [
  {
    id: 'aws-cloud-practitioner',
    name: 'AWS Cloud Practitioner',
    description: 'Practice questions for AWS Certified Cloud Practitioner exam covering cloud concepts, security, and AWS services.',
    dateAdded: new Date().toISOString(),
    questions: [
      {
        question: "BlueQuill Systems, a design automation startup, wants to add generative AI to tools used by eight internal teams and is comparing Amazon Q for automating enterprise workflows with Amazon Bedrock for working with foundation models; which statements correctly explain their key differences in capabilities, model choice, and typical use so the team can assign the right service to each workload? (Choose 2)",
        options: [
          "Amazon Q allows you to pick from multiple foundation models, whereas Amazon Bedrock restricts you to a single default model",
          "Amazon Q is a generative AI assistant for ready-to-use business and developer workflows, while Amazon Bedrock is a managed platform to build and scale generative AI solutions with foundation models",
          "Both Amazon Q and Amazon Bedrock are assistants that ship as prepackaged generative AI apps",
          "Amazon Bedrock offers a catalog of foundation models to choose from, but Amazon Q does not let you select the underlying model",
          "Amazon SageMaker is the only AWS service for generative AI"
        ],
        correct_answer: "Amazon Q is a generative AI assistant for ready-to-use business and developer workflows, while Amazon Bedrock is a managed platform to build and scale generative AI solutions with foundation models, Amazon Bedrock offers a catalog of foundation models to choose from, but Amazon Q does not let you select the underlying model",
        explanation: "Amazon Q is designed as a ready-to-use AI assistant for business tasks and developer workflows, while Amazon Bedrock provides access to multiple foundation models for building custom AI solutions."
      },
      {
        question: "Which AWS service provides a fully managed NoSQL database?",
        options: [
          "Amazon RDS",
          "Amazon DynamoDB",
          "Amazon Redshift",
          "Amazon Aurora"
        ],
        correct_answer: "Amazon DynamoDB",
        explanation: "Amazon DynamoDB is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability."
      },
      {
        question: "What is the primary benefit of using AWS Lambda?",
        options: [
          "You must manage the underlying servers",
          "You pay for compute time only when your code runs",
          "It provides dedicated physical servers",
          "It requires manual scaling configuration"
        ],
        correct_answer: "You pay for compute time only when your code runs",
        explanation: "AWS Lambda is a serverless compute service where you only pay for the compute time consumed - there is no charge when your code is not running."
      },
      {
        question: "Which AWS service is used to distribute traffic across multiple EC2 instances?",
        options: [
          "Amazon Route 53",
          "AWS Auto Scaling",
          "Elastic Load Balancing",
          "Amazon CloudFront"
        ],
        correct_answer: "Elastic Load Balancing",
        explanation: "Elastic Load Balancing automatically distributes incoming application traffic across multiple targets, such as Amazon EC2 instances."
      },
      {
        question: "What does Amazon S3 stand for?",
        options: [
          "Simple Storage Service",
          "Secure Storage System",
          "Scalable Storage Solution",
          "Standard Storage Service"
        ],
        correct_answer: "Simple Storage Service",
        explanation: "Amazon S3 stands for Simple Storage Service. It is an object storage service that offers industry-leading scalability, data availability, security, and performance."
      },
      {
        question: "Which AWS service provides a virtual network dedicated to your AWS account?",
        options: [
          "Amazon VPC",
          "AWS Direct Connect",
          "Amazon Route 53",
          "AWS Transit Gateway"
        ],
        correct_answer: "Amazon VPC",
        explanation: "Amazon Virtual Private Cloud (VPC) lets you provision a logically isolated section of the AWS Cloud where you can launch AWS resources in a virtual network that you define."
      },
      {
        question: "What is the AWS shared responsibility model?",
        options: [
          "AWS is responsible for all security",
          "Customers are responsible for all security",
          "AWS manages security OF the cloud, customers manage security IN the cloud",
          "Security responsibilities are negotiated per customer"
        ],
        correct_answer: "AWS manages security OF the cloud, customers manage security IN the cloud",
        explanation: "Under the shared responsibility model, AWS is responsible for the security of the cloud infrastructure, while customers are responsible for security of their data, applications, and configurations in the cloud."
      },
      {
        question: "Which AWS service provides managed Kubernetes?",
        options: [
          "Amazon ECS",
          "Amazon EKS",
          "AWS Fargate",
          "AWS Lambda"
        ],
        correct_answer: "Amazon EKS",
        explanation: "Amazon Elastic Kubernetes Service (EKS) is a managed Kubernetes service that makes it easy to run Kubernetes on AWS without needing to install and operate your own Kubernetes control plane."
      },
      {
        question: "What is the purpose of AWS IAM?",
        options: [
          "Monitor application performance",
          "Manage user access and permissions",
          "Store database backups",
          "Deploy containerized applications"
        ],
        correct_answer: "Manage user access and permissions",
        explanation: "AWS Identity and Access Management (IAM) enables you to manage access to AWS services and resources securely by creating and managing AWS users and groups, and using permissions to allow and deny access."
      },
      {
        question: "Which AWS service is a content delivery network (CDN)?",
        options: [
          "Amazon S3",
          "Amazon CloudFront",
          "AWS Global Accelerator",
          "Amazon Route 53"
        ],
        correct_answer: "Amazon CloudFront",
        explanation: "Amazon CloudFront is a fast content delivery network (CDN) service that securely delivers data, videos, applications, and APIs to customers globally with low latency and high transfer speeds."
      }
    ]
  },
  {
    id: 'aws-solutions-architect',
    name: 'AWS Solutions Architect Associate',
    description: 'Practice questions for AWS Certified Solutions Architect - Associate exam covering architecture design and best practices.',
    dateAdded: new Date().toISOString(),
    questions: [
      {
        question: "A company needs to store 10 TB of data that will be accessed infrequently but must be retrieved within minutes when needed. Which S3 storage class should they use?",
        options: [
          "S3 Standard",
          "S3 Intelligent-Tiering",
          "S3 Standard-IA",
          "S3 Glacier Deep Archive"
        ],
        correct_answer: "S3 Standard-IA",
        explanation: "S3 Standard-IA is designed for infrequently accessed data that requires rapid access when needed. It offers lower storage costs than S3 Standard while maintaining the same durability and availability."
      },
      {
        question: "Which AWS service can be used to decouple application components and enable asynchronous processing?",
        options: [
          "Amazon RDS",
          "Amazon SQS",
          "Amazon EC2",
          "Amazon VPC"
        ],
        correct_answer: "Amazon SQS",
        explanation: "Amazon Simple Queue Service (SQS) is a fully managed message queuing service that enables you to decouple and scale microservices, distributed systems, and serverless applications."
      },
      {
        question: "A solutions architect needs to design a highly available architecture across multiple Availability Zones. Which load balancer type supports this requirement for HTTP/HTTPS traffic?",
        options: [
          "Classic Load Balancer only",
          "Application Load Balancer",
          "Network Load Balancer only",
          "Gateway Load Balancer"
        ],
        correct_answer: "Application Load Balancer",
        explanation: "Application Load Balancer operates at Layer 7 and is ideal for HTTP/HTTPS traffic. It supports multiple Availability Zones for high availability and provides advanced routing capabilities."
      },
      {
        question: "Which service provides a way to run containers without having to manage servers or clusters?",
        options: [
          "Amazon EC2",
          "AWS Fargate",
          "Amazon EKS worker nodes",
          "AWS Outposts"
        ],
        correct_answer: "AWS Fargate",
        explanation: "AWS Fargate is a serverless compute engine for containers that works with both Amazon ECS and Amazon EKS. You don't need to provision, configure, or scale clusters of virtual machines."
      },
      {
        question: "What is the maximum size of an object that can be uploaded to Amazon S3 in a single PUT operation?",
        options: [
          "5 MB",
          "100 MB",
          "5 GB",
          "5 TB"
        ],
        correct_answer: "5 GB",
        explanation: "The maximum size of a single PUT operation to S3 is 5 GB. For objects larger than 100 MB, AWS recommends using multipart upload, which supports objects up to 5 TB."
      },
      {
        question: "Which AWS service enables you to create private connections between AWS and your on-premises data center?",
        options: [
          "AWS VPN",
          "AWS Direct Connect",
          "Amazon VPC Peering",
          "AWS Transit Gateway"
        ],
        correct_answer: "AWS Direct Connect",
        explanation: "AWS Direct Connect creates a dedicated network connection from your premises to AWS, providing more consistent network performance than internet-based connections."
      },
      {
        question: "A company wants to use a managed relational database that is compatible with MySQL and PostgreSQL but offers 5x better performance. Which service should they choose?",
        options: [
          "Amazon RDS for MySQL",
          "Amazon Aurora",
          "Amazon DynamoDB",
          "Amazon Redshift"
        ],
        correct_answer: "Amazon Aurora",
        explanation: "Amazon Aurora is a MySQL and PostgreSQL-compatible relational database that offers up to 5x the throughput of standard MySQL and 3x the throughput of standard PostgreSQL."
      },
      {
        question: "Which caching service is fully managed and compatible with Redis and Memcached?",
        options: [
          "Amazon DynamoDB Accelerator",
          "Amazon ElastiCache",
          "Amazon CloudFront",
          "AWS Global Accelerator"
        ],
        correct_answer: "Amazon ElastiCache",
        explanation: "Amazon ElastiCache is a fully managed in-memory caching service compatible with Redis and Memcached. It improves application performance by retrieving data from fast, managed in-memory caches."
      }
    ]
  },
  {
    id: 'general-cloud-concepts',
    name: 'Cloud Computing Fundamentals',
    description: 'Basic cloud computing concepts and terminology for beginners.',
    dateAdded: new Date().toISOString(),
    questions: [
      {
        question: "What is cloud computing?",
        options: [
          "A type of weather forecasting system",
          "On-demand delivery of IT resources over the internet",
          "A local server infrastructure",
          "A programming language"
        ],
        correct_answer: "On-demand delivery of IT resources over the internet",
        explanation: "Cloud computing is the on-demand delivery of compute power, database storage, applications, and other IT resources through a cloud services platform via the internet with pay-as-you-go pricing."
      },
      {
        question: "What does IaaS stand for?",
        options: [
          "Internet as a Service",
          "Infrastructure as a Service",
          "Integration as a Service",
          "Intelligence as a Service"
        ],
        correct_answer: "Infrastructure as a Service",
        explanation: "Infrastructure as a Service (IaaS) provides virtualized computing resources over the internet, including servers, storage, and networking."
      },
      {
        question: "Which cloud deployment model keeps all resources on-premises but uses cloud-like technologies?",
        options: [
          "Public Cloud",
          "Private Cloud",
          "Hybrid Cloud",
          "Community Cloud"
        ],
        correct_answer: "Private Cloud",
        explanation: "A private cloud is a cloud computing environment dedicated to a single organization, either on-premises or hosted by a third party, using cloud technologies and practices."
      },
      {
        question: "What is the main advantage of the pay-as-you-go pricing model?",
        options: [
          "Requires large upfront investments",
          "Pay only for resources you actually use",
          "Fixed monthly pricing regardless of usage",
          "Requires long-term contracts"
        ],
        correct_answer: "Pay only for resources you actually use",
        explanation: "Pay-as-you-go pricing means you only pay for the computing resources you consume, eliminating the need for large upfront capital expenditures."
      },
      {
        question: "What does SaaS stand for?",
        options: [
          "Storage as a Service",
          "Software as a Service",
          "Security as a Service",
          "Server as a Service"
        ],
        correct_answer: "Software as a Service",
        explanation: "Software as a Service (SaaS) delivers software applications over the internet, on a subscription basis, managed by the service provider."
      },
      {
        question: "What is horizontal scaling?",
        options: [
          "Adding more power to existing servers",
          "Adding more servers to handle increased load",
          "Reducing server capacity",
          "Moving to a different cloud provider"
        ],
        correct_answer: "Adding more servers to handle increased load",
        explanation: "Horizontal scaling (scaling out) means adding more instances or servers to distribute the load, as opposed to vertical scaling which adds more power to existing machines."
      }
    ]
  }
];

export async function loadSampleQuestionBanks(): Promise<void> {
  // First, try to load from server
  const serverBanks = await fetchQuestionBanksFromServer();
  
  const existingBanks = JSON.parse(localStorage.getItem('exam_portal_question_banks') || '[]');
  const existingIds = new Set(existingBanks.map((b: QuestionBank) => b.id));
  
  // Merge server banks with sample banks
  const allAvailableBanks = [...serverBanks, ...sampleQuestionBanks];
  const newBanks = allAvailableBanks.filter(b => !existingIds.has(b.id));
  
  if (newBanks.length > 0) {
    const allBanks = [...existingBanks, ...newBanks];
    localStorage.setItem('exam_portal_question_banks', JSON.stringify(allBanks));
  }
}
