# Cost Management Guide

## Quick Reference: What to Stop to Avoid Charges

### 🛑 Stop These to Save Money:

1. **EC2 Instance** (when not in use)
   - Saves: ~$8.50/month
   - Command: `aws ec2 stop-instances --instance-ids <id>`
   - Still costs: ~$2/month for EBS storage

2. **RDS Database** (when not in use)
   - Saves: ~$12.50/month
   - Command: `aws rds stop-db-instance --db-instance-identifier <id>`
   - Still costs: ~$2/month for storage

### ✅ Always Free (No Need to Stop):

- VPC, Subnets, Security Groups
- IAM Roles and Policies
- Secrets Manager (under 10,000 secrets)
- CloudWatch Logs (under 5GB/month)

## Monthly Cost Breakdown

### Within Free Tier (First 12 Months):
- **Total: $0/month** ✅

### After Free Tier Expires:
- EC2 t2.micro (24/7): ~$8.50/month
- RDS db.t2.micro (24/7): ~$12.50/month
- EBS Storage (20GB): ~$2/month
- **Total: ~$23/month**

### When Stopped:
- EC2 stopped: ~$2/month (storage only)
- RDS stopped: ~$2/month (storage only)
- **Total: ~$4/month**

## Commands to Stop/Start Resources

### Stop Everything:
```bash
# Stop EC2
aws ec2 stop-instances --instance-ids $(terraform output -raw ec2_instance_id)

# Stop RDS
aws rds stop-db-instance --db-instance-identifier parking-finder-db-staging
```

### Start Everything:
```bash
# Start EC2
aws ec2 start-instances --instance-ids $(terraform output -raw ec2_instance_id)

# Start RDS (takes 5-10 minutes)
aws rds start-db-instance --db-instance-identifier parking-finder-db-staging
```

### Check Status:
```bash
# Check EC2 status
aws ec2 describe-instances --instance-ids $(terraform output -raw ec2_instance_id) --query 'Reservations[0].Instances[0].State.Name'

# Check RDS status
aws rds describe-db-instances --db-instance-identifier parking-finder-db-staging --query 'DBInstances[0].DBInstanceStatus'
```

## Set Up Billing Alerts

1. Go to AWS Console → Billing → Preferences
2. Enable "Receive Billing Alerts"
3. Go to CloudWatch → Alarms → Create Alarm
4. Select "Billing" metric
5. Set threshold (e.g., $5)
6. Add email notification

## Best Practices

1. ✅ **Stop instances when not developing**
2. ✅ **Use t2.micro/db.t2.micro** (cheapest free tier)
3. ✅ **Monitor usage** in AWS Console
4. ✅ **Set billing alerts** to avoid surprises
5. ✅ **Delete unused resources** with `terraform destroy`

## Free Tier Limits

- **EC2**: 750 hours/month (enough for 1 instance 24/7)
- **RDS**: 750 hours/month (enough for 1 instance 24/7)
- **EBS**: 30 GB/month
- **CloudWatch Logs**: 5 GB ingestion/month
- **Secrets Manager**: 10,000 secrets/month

**Note**: If you run both EC2 and RDS 24/7, you'll use 2x the hours (1500 hours total), which exceeds the free tier limit.

## Cost Optimization Tips

1. **Stop instances overnight/weekends**
2. **Use single AZ** (not multi-AZ)
3. **Disable encryption** (for free tier)
4. **Reduce backup retention** to 1 day
5. **Delete old snapshots**
6. **Monitor CloudWatch logs size**
