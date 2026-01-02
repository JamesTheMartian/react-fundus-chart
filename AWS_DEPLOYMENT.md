# AWS Deployment Guide

This guide explains how to build your React Fundus Chart application locally and deploy it to AWS EC2 (or any resource-constrained server).

## Why This Approach?

Building a React + TypeScript application requires significant memory and CPU resources. On resource-constrained servers like AWS t3.nano, the build process can fail or take extremely long. This deployment system solves that by:

1. **Building locally** on your development machine (with sufficient resources)
2. **Creating optimized Docker images** with pre-built artifacts
3. **Packaging and transferring** lightweight images to your server
4. **Running on the server** without any build steps

## Quick Start

### Build Everything for AWS

```bash
make aws
```

This single command will:
- Build the client dist folder with `VITE_BASE_PATH=/`
- Build the server dist folder (TypeScript compilation)
- Create optimized Docker images
- Package both images as compressed tar.gz files

The output will be in the `aws-build/` directory:
- `client-image.tar.gz` (~25-30MB)
- `server-image.tar.gz` (~150-180MB)

### Deploy to AWS

1. **Transfer files to your server:**
   ```bash
   scp aws-build/*.tar.gz your-user@your-server-ip:/home/your-user/app/
   scp docker-compose.aws.yml your-user@your-server-ip:/home/your-user/app/
   ```

2. **SSH into your server:**
   ```bash
   ssh your-user@your-server-ip
   cd /home/your-user/app
   ```

3. **Load Docker images:**
   ```bash
   docker load < client-image.tar.gz
   docker load < server-image.tar.gz
   ```

4. **Start the application:**
   ```bash
   docker-compose -f docker-compose.aws.yml up -d
   ```

5. **Verify it's running:**
   ```bash
   docker-compose -f docker-compose.aws.yml ps
   ```

Your application should now be accessible at `http://your-server-ip`

## Available Make Commands

| Command | Description |
|---------|-------------|
| `make aws` | Build everything for AWS deployment |
| `make aws-client` | Build only the client image |
| `make aws-server` | Build only the server image |
| `make aws-build-client` | Build only client dist folder |
| `make aws-build-server` | Build only server dist folder |
| `make aws-clean` | Clean all AWS build artifacts |
| `make aws-load` | Load images from tar.gz (local testing) |
| `make aws-up` | Start containers locally (testing) |
| `make aws-down` | Stop containers |

## Testing Locally Before Deployment

Before deploying to AWS, you can test the Docker images locally:

```bash
# Build images
make aws

# Load and run locally
make aws-load
make aws-up

# Test at http://localhost
curl http://localhost

# Stop containers
make aws-down
```

## Optimizations

### Client Dockerfile
- Uses single-stage build with `nginx:alpine` (~25MB base)
- No Node.js installation needed
- No build tools or dependencies
- Configured Nginx with:
  - API proxy to backend
  - SPA routing support
  - Static asset caching
  - Health check endpoint

### Server Dockerfile
- Production-only dependencies (`npm ci --only=production`)
- No TypeScript or dev dependencies
- Runs as non-root user for security
- Direct `node` execution (faster than `npm start`)
- Health check integration

### Image Sizes
- **Client**: ~25-30MB (vs ~200MB+ with build stage)
- **Server**: ~150-180MB (vs ~300MB+ with dev dependencies)

## Environment Variables

The build process sets these environment variables:

### Client
- `VITE_BASE_PATH=/` - Application base path
- `VITE_API_BASE_URL=/api` - API endpoint (proxied by Nginx)
- `VITE_USE_MOCK_API=false` - Use real API

### Server
- `NODE_ENV=production` - Production mode
- `PORT=3000` - Server port
- `ENCRYPTION_KEY` - **Critical**: 64-character hex string for database encryption. Must be kept secret.

## Updating Your Application

When you make changes to your code:

1. **Rebuild locally:**
   ```bash
   make aws
   ```

2. **Transfer new images:**
   ```bash
   scp aws-build/*.tar.gz your-user@your-server-ip:/home/your-user/app/
   ```

3. **On the server:**
   ```bash
   # Stop containers
   docker-compose -f docker-compose.aws.yml down
   
   # Load new images
   docker load < client-image.tar.gz
   docker load < server-image.tar.gz
   
   # Start updated containers
   docker-compose -f docker-compose.aws.yml up -d
   ```

## Troubleshooting

### Images are too large to transfer
- Use compression options in scp: `scp -C aws-build/*.tar.gz ...`
- Consider using rsync: `rsync -avz --progress aws-build/ user@server:/path/`

### Container won't start
```bash
# Check logs
docker-compose -f docker-compose.aws.yml logs

# Check specific service
docker-compose -f docker-compose.aws.yml logs client
docker-compose -f docker-compose.aws.yml logs server
```

### Health check failing
```bash
# Test endpoints manually
curl http://localhost/health  # Client health
docker exec fundus-server wget -O- http://localhost:3000/api/health  # Server health
```

### Need to rebuild without cache
```bash
docker-compose -f docker-compose.aws.yml build --no-cache
```

## Production Considerations

1. **Persistent Data**: The server's data directory is mounted at `./server/data` - ensure this is backed up

2. **Port Configuration**: Default is port 80 for client. To use a different port:
   ```yaml
   # In docker-compose.aws.yml
   ports:
     - "8080:80"  # Change 8080 to your desired port
   ```

3. **SSL/HTTPS**: Consider using a reverse proxy (Nginx, Caddy) or AWS Load Balancer for SSL termination

4. **Monitoring**: The containers have health checks. Use `docker-compose ps` to monitor their status

5. **Logs**: Access logs with `docker-compose -f docker-compose.aws.yml logs -f`

## Architecture

```
┌─────────────────────────────────────────┐
│         Your Local Machine              │
│                                         │
│  ┌──────────────┐   ┌──────────────┐  │
│  │ npm run build│   │ npm run build│  │
│  │  (client)    │   │  (server)    │  │
│  └──────┬───────┘   └──────┬───────┘  │
│         │                  │           │
│         ▼                  ▼           │
│  ┌──────────────┐   ┌──────────────┐  │
│  │ client/dist  │   │ server/dist  │  │
│  └──────┬───────┘   └──────┬───────┘  │
│         │                  │           │
│         ▼                  ▼           │
│  ┌──────────────────────────────────┐ │
│  │  Docker Build (Dockerfile.aws)   │ │
│  └───────────────┬──────────────────┘ │
│                  │                     │
│                  ▼                     │
│         ┌────────────────┐            │
│         │  *.tar.gz      │            │
│         └────────┬───────┘            │
└──────────────────┼────────────────────┘
                   │ SCP/Transfer
                   ▼
┌─────────────────────────────────────────┐
│           AWS EC2 Server                │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  docker load < *.tar.gz          │  │
│  └───────────────┬──────────────────┘  │
│                  │                     │
│                  ▼                     │
│  ┌──────────────────────────────────┐ │
│  │ docker-compose up -d             │ │
│  └──────────────────────────────────┘ │
│                                        │
│   Client (Nginx) ←──→ Server (Node)  │
│        :80                :3000       │
└─────────────────────────────────────────┘
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Docker logs: `docker-compose -f docker-compose.aws.yml logs`
3. Verify images loaded correctly: `docker images | grep react-fundus-chart`
