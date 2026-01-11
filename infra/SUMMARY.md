# Infrastructure Summary - Free Tier Setup

## ✅ Changes Made for Free Tier

### Removed (Costly Services):
1. ❌ **Application Load Balancer (ALB)** - Removed as requested
   - Would cost: ~$16/month + data transfer
   
2. ❌ **NAT Gateway** - Removed
   - Would cost: ~$32/month + data transfer
   
3. ❌ **ECS Fargate** - Replaced with EC2
   - Would cost: ~$0.04/vCPU-hour + $0.004/GB-hour

### Replaced With (Free Tier Services):
1. ✅ **EC2 t2.micro** - Free tier eligible
   - 750 hours/month free for 12 months
   - Runs Docker container with backend
   - Public IP for direct access (no ALB needed)

2. ✅ **RDS db.t2.micro** - Free tier eligible
   - 750 hours/month free for 12 months
   - 20GB storage (free tier limit)
   - Single AZ (multi-AZ disabled to save costs)

3. ✅ **Simplified Networking**
   - Public subnet for EC2
   - Private subnet for RDS
   - No NAT Gateway (RDS doesn't need internet)

## 📊 Cost Breakdown

### Within Free Tier (First 12 Months):
- **Total: $0/month** ✅

### After Free Tier Expires:
- EC2 t2.micro: ~$8.50/month (if running 24/7)
- RDS db.t2.micro: ~$12.50/month (if running 24/7)
- EBS Storage: ~$2/month
- **Total: ~$23/month**

### When Stopped:
- EC2 stopped: ~$2/month (storage only)
- RDS stopped: ~$2/month (storage only)
- **Total: ~$4/month**

## 🛑 How to Stop Resources (Avoid Charges)

### Stop EC2:
```bash
aws ec2 stop-instances --instance-ids $(terraform output -raw ec2_instance_id)
```

### Stop RDS:
```bash
aws rds stop-db-instance --db-instance-identifier parking-finder-db-staging
```

### Start EC2:
```bash
aws ec2 start-instances --instance-ids $(terraform output -raw ec2_instance_id)
```

### Start RDS:
```bash
aws rds start-db-instance --db-instance-identifier parking-finder-db-staging
```

## 📝 Important Notes

1. **Free Tier is for 12 months** from AWS account creation
2. **750 hours = ~31 days** - enough for one instance running 24/7
3. **If running both EC2 and RDS 24/7**, you'll use 2x hours (1500 total)
4. **Storage charges apply even when stopped** (~$2/month for 20GB)
5. **Always stop instances when not in use** to save free tier hours

## 🔧 Architecture

```
Internet
   │
   ▼
EC2 (Public Subnet)
   │ Port 3000
   │
   ▼
RDS (Private Subnet)
   │ Port 5432
```

- **EC2**: Public IP, accessible directly on port 3000
- **RDS**: Private subnet, only accessible from EC2
- **No ALB**: Direct access to EC2 public IP
- **No NAT**: RDS doesn't need internet access

## 📚 Documentation

- [FREE_TIER_GUIDE.md](FREE_TIER_GUIDE.md) - Detailed free tier information
- [COST_MANAGEMENT.md](COST_MANAGEMENT.md) - Cost management commands
- [README.md](README.md) - Terraform setup instructions

## ⚠️ Security Notes

1. **EC2 Security Group**: Allows HTTP (3000) and SSH (22) from anywhere
   - **Restrict SSH in production** to your IP only
   
2. **RDS Security Group**: Only allows PostgreSQL (5432) from EC2
   - Database is not publicly accessible ✅

3. **Secrets Manager**: Stores database credentials and JWT secret securely
   - EC2 fetches secrets at startup using IAM role

## 🚀 Deployment

1. Configure `terraform.tfvars` with your values
2. Run `terraform init`
3. Run `terraform plan` to review
4. Run `terraform apply` to deploy
5. Get API URL: `terraform output api_url`

## 📞 Access

- **API URL**: `http://<EC2_PUBLIC_IP>:3000`
- **SSH**: `ssh -i your-key.pem ec2-user@<EC2_PUBLIC_IP>`
- **Database**: Only accessible from EC2 instance
