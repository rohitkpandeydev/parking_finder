# AWS Free Tier Guide

This infrastructure is configured to use **AWS Free Tier eligible services only** to minimize costs.

## Free Tier Services Used

### ✅ Included (Free Tier Eligible)

1. **EC2 t2.micro or t3.micro**
   - 750 hours/month free for 12 months
   - 1 vCPU, 1 GB RAM
   - **Cost if exceeded**: ~$0.0116/hour

2. **RDS db.t2.micro or db.t3.micro**
   - 750 hours/month free for 12 months
   - 20 GB storage (free tier limit)
   - **Cost if exceeded**: ~$0.017/hour + storage costs

3. **VPC, Subnets, Security Groups**
   - Always free (no charges)

4. **Secrets Manager**
   - First 10,000 secrets free per month
   - **Cost if exceeded**: $0.40/secret/month

5. **CloudWatch Logs**
   - 5 GB log ingestion free per month
   - 10 custom metrics free
   - **Cost if exceeded**: $0.50/GB ingested

6. **IAM Roles and Policies**
   - Always free

7. **EBS Storage (for EC2)**
   - 30 GB free per month (gp2)
   - **Cost if exceeded**: ~$0.10/GB/month

## ❌ Removed (Not Free Tier / Charges Apply)

1. **Application Load Balancer (ALB)**
   - Removed as requested
   - Would cost: ~$16/month + data transfer

2. **NAT Gateway**
   - Removed to avoid charges
   - Would cost: ~$32/month + data transfer

3. **ECS Fargate**
   - Replaced with EC2 (free tier)
   - Would cost: ~$0.04/vCPU-hour + $0.004/GB-hour

4. **Multi-AZ RDS**
   - Disabled (single AZ only)
   - Would cost: 2x the instance cost

5. **RDS Encryption**
   - Disabled for free tier
   - Would cost: Additional storage charges

6. **RDS Automated Backups (7 days)**
   - Reduced to 1 day for free tier
   - Would cost: Storage for backups

## Cost Breakdown (Free Tier)

### Within Free Tier Limits:
- **EC2**: $0/month (750 hours free)
- **RDS**: $0/month (750 hours free)
- **VPC/Networking**: $0/month
- **Secrets Manager**: $0/month (under 10,000 secrets)
- **CloudWatch**: $0/month (under 5GB logs)
- **EBS**: $0/month (under 30GB)

**Total: $0/month** (within free tier limits)

### After Free Tier Expires (12 months):
- **EC2 t2.micro**: ~$8.50/month (if running 24/7)
- **RDS db.t2.micro**: ~$12.50/month (if running 24/7)
- **EBS Storage**: ~$2/month (20GB)
- **Other services**: ~$0-5/month

**Estimated Total: ~$23-28/month** (after free tier)

## How to Stop/Start Resources to Avoid Charges

### To Stop Everything (No Charges):

1. **Stop EC2 Instance**:
   ```bash
   aws ec2 stop-instances --instance-ids <instance-id>
   ```
   - **Cost when stopped**: $0 (only EBS storage charges apply ~$2/month for 20GB)

2. **Stop RDS Instance**:
   ```bash
   aws rds stop-db-instance --db-instance-identifier <db-id>
   ```
   - **Cost when stopped**: $0 (only storage charges apply ~$2/month for 20GB)

3. **Delete Resources** (if not needed):
   ```bash
   terraform destroy
   ```
   - **Cost**: $0 (everything deleted)

### To Minimize Charges:

1. **Stop EC2 when not in use**:
   - Saves: ~$8.50/month
   - Storage still costs: ~$2/month

2. **Stop RDS when not in use**:
   - Saves: ~$12.50/month
   - Storage still costs: ~$2/month

3. **Use Spot Instances** (advanced):
   - Can save up to 90% on EC2 costs
   - Risk of interruption

## Monitoring Costs

### Set Up Billing Alerts:

1. Go to AWS Billing Dashboard
2. Create a billing alarm in CloudWatch
3. Set threshold (e.g., $5/month)
4. Get notified if costs exceed threshold

### Check Current Costs:

```bash
# Install AWS Cost Explorer CLI or use AWS Console
# Monitor in AWS Billing Dashboard
```

## Important Notes

1. **Free Tier is for 12 months** from account creation
2. **750 hours = ~31 days** - enough for one instance running 24/7
3. **If you run both EC2 and RDS 24/7**, you'll use 2x the hours
4. **Always stop instances when not in use** to save free tier hours
5. **Storage charges apply even when stopped** (~$2/month for 20GB)

## Recommended Setup for Development

1. **Start instances only when developing**
2. **Stop instances when done** (saves free tier hours)
3. **Use smaller instance types** (t2.micro, db.t2.micro)
4. **Monitor usage** in AWS Console
5. **Set up billing alerts** to avoid surprises

## Terraform Commands to Stop Resources

```bash
# Stop EC2
aws ec2 stop-instances --instance-ids $(terraform output -raw ec2_instance_id)

# Stop RDS
aws rds stop-db-instance --db-instance-identifier parking-finder-db-staging

# Start EC2
aws ec2 start-instances --instance-ids $(terraform output -raw ec2_instance_id)

# Start RDS
aws rds start-db-instance --db-instance-identifier parking-finder-db-staging
```

## Cost Optimization Tips

1. ✅ Use t2.micro instead of t3.micro (slightly cheaper)
2. ✅ Use db.t2.micro instead of db.t3.micro (slightly cheaper)
3. ✅ Stop instances when not in use
4. ✅ Use single AZ (not multi-AZ)
5. ✅ Disable encryption (for free tier)
6. ✅ Reduce backup retention to 1 day
7. ✅ Monitor CloudWatch logs size
8. ✅ Delete unused snapshots
