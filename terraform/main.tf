terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.0"
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "WISE2"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Security Group
resource "aws_security_group" "wise2_prod" {
  name        = "wise2-prod-sg"
  description = "WISE² Production Security Group"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_ips
    description = "SSH"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = {
    Name = "wise2-prod-sg"
  }
}

# EC2 Instance
resource "aws_instance" "wise2_prod" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.key_pair_name

  vpc_security_group_ids = [aws_security_group.wise2_prod.id]
  iam_instance_profile   = aws_iam_instance_profile.wise2_prod.name

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 100
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name = "wise2-prod-root"
    }
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  user_data = base64encode(file("${path.module}/../scripts/ec2-bootstrap.sh"))

  tags = {
    Name = "wise2-prod"
  }

  depends_on = [
    aws_security_group.wise2_prod,
  ]
}

# Elastic IP
resource "aws_eip" "wise2_prod" {
  instance = aws_instance.wise2_prod.id
  domain   = "vpc"

  tags = {
    Name = "wise2-prod-eip"
  }

  depends_on = [aws_instance.wise2_prod]
}

# IAM Role for EC2
resource "aws_iam_role" "wise2_prod" {
  name = "wise2-prod-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for S3 Backups
resource "aws_iam_role_policy" "wise2_s3_backups" {
  name = "wise2-s3-backups"
  role = aws_iam_role.wise2_prod.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.wise2_backups.arn,
          "${aws_s3_bucket.wise2_backups.arn}/*"
        ]
      }
    ]
  })
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "wise2_prod" {
  name = "wise2-prod-profile"
  role = aws_iam_role.wise2_prod.name
}

# S3 Bucket for Backups
resource "aws_s3_bucket" "wise2_backups" {
  bucket = "wise2-backups-${var.environment}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "wise2-backups"
  }
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "wise2_backups" {
  bucket = aws_s3_bucket.wise2_backups.id

  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "wise2_backups" {
  bucket = aws_s3_bucket.wise2_backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket Lifecycle Policy
resource "aws_s3_bucket_lifecycle_configuration" "wise2_backups" {
  bucket = aws_s3_bucket.wise2_backups.id

  rule {
    id     = "delete-old-backups"
    status = "Enabled"

    expiration {
      days = 90
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "ec2_cpu" {
  alarm_name          = "wise2-prod-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Alert when CPU exceeds 80%"
  treat_missing_data  = "notBreaching"

  dimensions = {
    InstanceId = aws_instance.wise2_prod.id
  }

  alarm_actions = var.alarm_actions
}

resource "aws_cloudwatch_metric_alarm" "ec2_status" {
  alarm_name          = "wise2-prod-status-check"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "Alert when instance status checks fail"
  treat_missing_data  = "notBreaching"

  dimensions = {
    InstanceId = aws_instance.wise2_prod.id
  }

  alarm_actions = var.alarm_actions
}

# Data sources
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
}

data "aws_caller_identity" "current" {}

# Outputs
output "instance_id" {
  value       = aws_instance.wise2_prod.id
  description = "EC2 Instance ID"
}

output "public_ip" {
  value       = aws_eip.wise2_prod.public_ip
  description = "Public IP Address"
}

output "public_dns" {
  value       = aws_eip.wise2_prod.public_dns
  description = "Public DNS Name"
}

output "s3_bucket" {
  value       = aws_s3_bucket.wise2_backups.id
  description = "S3 Backup Bucket"
}
