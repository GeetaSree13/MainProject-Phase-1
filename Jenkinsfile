pipeline {
    agent any
    
    // Auto-trigger build on SCM changes (polls every minute)
    triggers {
        pollSCM('* * * * *')
    }
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_REPO = "geetasree0103/todo-app"
        APP_VERSION = "v1.0.${BUILD_NUMBER}"
        KUBECONFIG_CREDENTIALS = 'kubeconfig'
        PATH = "/usr/local/bin:${env.PATH}"
    }
    
    stages {
        stage('Checkout from GitHub') {
            steps {
                echo "🔄 Cloning GitHub repository..."
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo "🐳 Building Docker image from Dockerfile..."
                    sh """
                        export DOCKER_CONFIG=\$(mktemp -d)
                        echo '{}' > \$DOCKER_CONFIG/config.json
                        docker build -t $DOCKERHUB_REPO:$APP_VERSION .
                    """
                }
            }
        }
        
        stage('Login to DockerHub') {
            steps {
                script {
                    echo "🔐 Logging into Docker Hub..."
                    sh """
                        docker login -u $DOCKERHUB_CREDENTIALS_USR -p $DOCKERHUB_CREDENTIALS_PSW
                    """
                }
            }
        }
        
        stage('Push Docker Image to DockerHub') {
            steps {
                script {
                    echo "🚀 Pushing Docker image to DockerHub..."
                    sh """
                        docker push $DOCKERHUB_REPO:$APP_VERSION
                        docker tag $DOCKERHUB_REPO:$APP_VERSION $DOCKERHUB_REPO:latest
                        docker push $DOCKERHUB_REPO:latest
                    """
                }
            }
        }
        
        stage('Deploy to Kubernetes Cluster') {
            steps {
                withKubeConfig([credentialsId: "${KUBECONFIG_CREDENTIALS}"]) {
                    script {
                        echo "☸️ Deploying to Kubernetes cluster..."
                        sh """
                            # Replace image tag in deployment
                            sed -i "s|IMAGE_TAG|$APP_VERSION|g" k8s/deployment.yaml
                            
                            # Apply Kubernetes manifests
                            kubectl apply -f k8s/
                            
                            # Wait for deployment rollout
                            kubectl rollout status deployment/todo-app --timeout=300s
                            
                            # Get service information
                            echo "🌐 Service Details:"
                            kubectl get service todo-app-service
                            
                            # Get pod status
                            echo "📦 Pod Status:"
                            kubectl get pods -l app=todo-app
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo "✅ Build, Docker image, push, and Kubernetes deployment completed successfully!"
            echo "🎉 Application deployed with image: $DOCKERHUB_REPO:$APP_VERSION"
        }
        failure {
            echo "❌ Pipeline failed. Check logs for errors."
        }
        always {
            echo "🧹 Cleaning up Docker images..."
            sh '''
                docker image prune -f || true
                docker container prune -f || true
            '''
        }
    }
}