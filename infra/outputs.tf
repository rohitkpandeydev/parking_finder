output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.backend.id
}

output "ec2_public_ip" {
  description = "EC2 instance public IP"
  value       = aws_instance.backend.public_ip
}

output "ec2_public_dns" {
  description = "EC2 instance public DNS"
  value       = aws_instance.backend.public_dns
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
}

output "rds_address" {
  description = "RDS instance address"
  value       = aws_db_instance.main.address
}

output "api_url" {
  description = "API URL (use EC2 public IP or DNS)"
  value       = "http://${aws_instance.backend.public_ip}:3000"
}

output "ssh_command" {
  description = "SSH command to connect to EC2 instance"
  value       = "ssh -i your-key.pem ec2-user@${aws_instance.backend.public_ip}"
}
