# Secrets Manager Secret for Database Credentials
resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "${var.project_name}/db-credentials/${var.environment}"
  description = "Database credentials for ${var.project_name}"

  tags = {
    Name        = "${var.project_name}-db-credentials"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    DB_HOST     = aws_db_instance.main.address
    DB_PORT     = aws_db_instance.main.port
    DB_NAME     = aws_db_instance.main.db_name
    DB_USER     = aws_db_instance.main.username
    DB_PASSWORD = aws_db_instance.main.password
  })
}

# Secrets Manager Secret for JWT Secret
resource "aws_secretsmanager_secret" "jwt_secret" {
  name        = "${var.project_name}/jwt-secret/${var.environment}"
  description = "JWT secret for ${var.project_name}"

  tags = {
    Name        = "${var.project_name}-jwt-secret"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Generate random JWT secret if not provided
resource "random_password" "jwt" {
  count   = var.jwt_secret == "" ? 1 : 0
  length  = 32
  special = true
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id = aws_secretsmanager_secret.jwt_secret.id
  secret_string = jsonencode({
    JWT_SECRET = var.jwt_secret != "" ? var.jwt_secret : random_password.jwt[0].result
  })
}

# Note: IAM policy for EC2 to access secrets is defined in ec2.tf
