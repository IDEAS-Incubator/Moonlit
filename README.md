# Moonlit Deployment

## AWS EC2 Instance Setup

### Create an AWS Account:

- Sign up for one at AWS Console if you don't have an AWS account.

### Access AWS Console:

- Log in to the AWS Management Console.

### Navigate to EC2 Dashboard:

- Go to the "EC2 Dashboard."

### Launch an Instance:

1. Click on "Launch Instance" to create a new EC2 instance.
2. Select an Ubuntu Server AMI (choose the latest Ubuntu LTS version).

### Choose an Instance Type:

- For the server: Use `t2.micro`.
- For the client: Use `t2.small` (recommended `t2.medium`).

### Configure Instance:

- Configure instance details as per your requirements.
- Add storage: Set the size to 30 GB.
- Configure security group: Add a rule to allow TCP traffic for the application's port (e.g., 5000, 8000).

### Review and Launch:

- Review configuration and click "Launch."
- Create a key pair if needed.

### Access Your EC2 Instance:

- Use SSH to connect:

```bash
ssh -i /path/to/your/key.pem ubuntu@your-instance-ip
```

### Allow Port Access:

- Allow ports 80 and 8000 for frontend and backend in inbound rules.

---

## Installation Instructions

### Install Node.js and npm:

1. Install NVM:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 18.16.1
npm install
```

2. Verify versions:

```bash
node -v
npm -v
```

3. Install PM2 for process management:

```bash
npm install -g pm2
```

### Install Git:

```bash
sudo apt update
sudo apt install git
git --version
```

---

## Run

### Client Setup:

1. Clone the repository:

```bash
git clone https://github.com/bayesianinstitute/moonlit.git
```

2. Set environment variables:

```bash
cd moonlit/client
nano .env.local
```

In the .env.local

```bash
NEXT_PUBLIC_API_URL=
```

3. Install and run:

```bash
npm i
sudo ln -s $(which npm) /usr/local/bin/npm
sudo ln -s $(which node) /usr/local/bin/node
npm install -g pm2
npm run build
sudo env "PATH=$PATH" pm2 start "npm run start" --name client

```

### Server Setup:

1. Clone the repository:

```bash
git clone https://github.com/bayesianinstitute/moonlit.git
```

2. Set environment variables:

```bash
cd moonlit/backend
nano .env
```

In the .env

```bash
STABILITY_KEY=
OPENAI_API_KEY=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
CORS_ORIGINS=
```

3. Create and activate virtual environment:

```bash
python -m venv env
source env/bin/activate
pip install -r requirements.txt
```

4. Start server:

```bash
sudo env "PATH=$PATH" npm install -g pm2
pm2 start kartoon.py --interpreter python3
```
