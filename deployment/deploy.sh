#!/bin/bash

# Quick AWS Deployment Script for Cloud-Based Chatbot System
# This script automates the CloudFormation deployment process

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="chatbot-stack"
REGION="us-east-1"
KEY_NAME="chatbot-key"
INSTANCE_TYPE="t2.micro"
ENVIRONMENT="development"
TEMPLATE_FILE="./deployment/aws-config/cloudformation.yaml"

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
    print_success "AWS CLI found"

    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure'"
        exit 1
    fi
    print_success "AWS credentials configured"

    # Check template file
    if [ ! -f "$TEMPLATE_FILE" ]; then
        print_error "CloudFormation template not found: $TEMPLATE_FILE"
        exit 1
    fi
    print_success "CloudFormation template found"

    # Check Docker
    if command -v docker &> /dev/null; then
        print_success "Docker found"
    else
        print_warning "Docker not installed (optional)"
    fi

    echo ""
}

# Create EC2 Key Pair
create_key_pair() {
    print_header "Setting Up EC2 Key Pair"

    if aws ec2 describe-key-pairs --key-names "$KEY_NAME" --region "$REGION" &> /dev/null; then
        print_warning "Key pair '$KEY_NAME' already exists"
    else
        print_warning "Creating new key pair: $KEY_NAME"
        aws ec2 create-key-pair \
            --key-name "$KEY_NAME" \
            --region "$REGION" \
            --query 'KeyMaterial' \
            --output text > "$KEY_NAME.pem"
        
        chmod 400 "$KEY_NAME.pem"
        print_success "Key pair created: $KEY_NAME.pem"
        print_warning "Keep this file safe! You'll need it to SSH into your instance."
    fi

    echo ""
}

# Deploy CloudFormation Stack
deploy_stack() {
    print_header "Deploying CloudFormation Stack"

    # Check if stack already exists
    if aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" &> /dev/null; then
        
        print_warning "Stack '$STACK_NAME' already exists. Updating..."
        aws cloudformation update-stack \
            --stack-name "$STACK_NAME" \
            --template-body "file://$TEMPLATE_FILE" \
            --parameters \
                ParameterKey=InstanceType,ParameterValue="$INSTANCE_TYPE" \
                ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
                ParameterKey=KeyPairName,ParameterValue="$KEY_NAME" \
            --region "$REGION"
        
        print_success "Stack update initiated"
    else
        print_warning "Creating new stack: $STACK_NAME"
        aws cloudformation create-stack \
            --stack-name "$STACK_NAME" \
            --template-body "file://$TEMPLATE_FILE" \
            --parameters \
                ParameterKey=InstanceType,ParameterValue="$INSTANCE_TYPE" \
                ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
                ParameterKey=KeyPairName,ParameterValue="$KEY_NAME" \
            --capabilities CAPABILITY_IAM \
            --region "$REGION"
        
        print_success "Stack creation initiated"
    fi

    echo ""
}

# Wait for Stack Completion
wait_for_stack() {
    print_header "Waiting for Stack Deployment"

    print_warning "This may take 5-15 minutes. Monitoring stack events..."
    
    STACK_STATUS=""
    WAIT_TIME=0
    MAX_WAIT=900  # 15 minutes

    while [ $WAIT_TIME -lt $MAX_WAIT ]; do
        STACK_STATUS=$(aws cloudformation describe-stacks \
            --stack-name "$STACK_NAME" \
            --region "$REGION" \
            --query 'Stacks[0].StackStatus' \
            --output text 2>/dev/null || echo "UNKNOWN")

        case $STACK_STATUS in
            CREATE_COMPLETE|UPDATE_COMPLETE)
                print_success "Stack deployment completed!"
                echo ""
                return 0
                ;;
            CREATE_IN_PROGRESS|UPDATE_IN_PROGRESS)
                echo -ne "Status: $STACK_STATUS ... ${WAIT_TIME}s\r"
                sleep 5
                WAIT_TIME=$((WAIT_TIME + 5))
                ;;
            CREATE_FAILED|UPDATE_FAILED|ROLLBACK_COMPLETE|DELETE_IN_PROGRESS|DELETE_COMPLETE)
                print_error "Stack deployment failed with status: $STACK_STATUS"
                print_stack_events
                return 1
                ;;
            *)
                echo -ne "Status: $STACK_STATUS ... ${WAIT_TIME}s\r"
                sleep 5
                WAIT_TIME=$((WAIT_TIME + 5))
                ;;
        esac
    done

    print_error "Stack deployment timeout (max wait: ${MAX_WAIT}s)"
    return 1
}

# Print Stack Events
print_stack_events() {
    echo ""
    print_warning "Recent stack events:"
    aws cloudformation describe-stack-events \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'StackEvents[*].[Timestamp,ResourceStatus,ResourceType,LogicalResourceId,ResourceStatusReason]' \
        --output table | head -20
}

# Get Stack Outputs
get_stack_outputs() {
    print_header "Deployment Outputs"

    OUTPUTS=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs' \
        --region "$REGION")

    if [ -z "$OUTPUTS" ] || [ "$OUTPUTS" == "null" ]; then
        print_warning "No outputs available yet"
        return
    fi

    echo "$OUTPUTS" | jq -r '.[] | "\(.OutputKey): \(.OutputValue)"'
    echo ""
}

# SSH Instructions
print_ssh_instructions() {
    print_header "SSH Access Instructions"

    PUBLIC_IP=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`PublicIP`].OutputValue' \
        --output text 2>/dev/null || echo "PENDING")

    if [ "$PUBLIC_IP" != "PENDING" ] && [ ! -z "$PUBLIC_IP" ]; then
        echo "To connect to your instance:"
        echo ""
        echo "  ssh -i $KEY_NAME.pem ubuntu@$PUBLIC_IP"
        echo ""
        print_success "Application URL: http://$PUBLIC_IP:3000"
    else
        print_warning "IP address not yet assigned. Try again in a few moments."
    fi

    echo ""
}

# Build and Push Docker Image (Optional)
build_and_push_docker() {
    print_header "Docker Image Build (Optional)"

    read -p "Do you want to build and push a Docker image to ECR? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Building Docker image..."
        docker build -t chatbot-app:latest -f deployment/Dockerfile .
        print_success "Docker image built successfully"
        
        print_warning "Note: To push to ECR, you need to:"
        echo "1. Create an ECR repository: aws ecr create-repository --repository-name chatbot-app"
        echo "2. Login: aws ecr get-login-password | docker login ..."
        echo "3. Tag: docker tag chatbot-app:latest ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/chatbot-app:latest"
        echo "4. Push: docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/chatbot-app:latest"
    fi

    echo ""
}

# Cleanup Function
cleanup() {
    print_header "Cleanup"

    read -p "Do you want to delete the CloudFormation stack? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deleting stack: $STACK_NAME"
        aws cloudformation delete-stack \
            --stack-name "$STACK_NAME" \
            --region "$REGION"
        
        print_success "Stack deletion initiated"
        print_warning "This may take 5-10 minutes to complete"
    fi

    echo ""
}

# Main Script
main() {
    clear
    print_header "Cloud-Based Chatbot System - AWS Deployment"

    # Change to script directory
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    cd "$SCRIPT_DIR"

    # Menu
    echo "Select deployment option:"
    echo "1. Deploy to AWS (CloudFormation)"
    echo "2. Check Deployment Status"
    echo "3. Get Stack Information"
    echo "4. Cleanup (Delete Stack)"
    echo "5. Exit"
    echo ""
    read -p "Enter your choice (1-5): " choice

    case $choice in
        1)
            check_prerequisites
            create_key_pair
            deploy_stack
            wait_for_stack && {
                get_stack_outputs
                print_ssh_instructions
            }
            ;;
        2)
            check_prerequisites
            get_stack_outputs
            ;;
        3)
            check_prerequisites
            print_stack_events
            get_stack_outputs
            print_ssh_instructions
            ;;
        4)
            cleanup
            ;;
        5)
            echo "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

# Run main function
main
