pipeline {
    agent any
    
    // Auto-trigger build on SCM changes (polls every minute)
    triggers {
        pollSCM('* * * * *')
    }
    
    environment {
        // Docker registry credentials (configure in Jenkins)
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_REPO = 'geetasree13/todo-app'
        IMAGE_TAG = "${BUILD_NUMBER}"
        KUBECONFIG_CREDENTIAL_ID = 'kubeconfig'
        DOCKER_CREDENTIAL_ID = 'docker-hub-credentials'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo 'Building Docker image...'
                    
                    // Use full path to docker to avoid PATH issues
                    sh "/usr/local/bin/docker build -t ${DOCKER_REPO}:${IMAGE_TAG} ."
                    sh "/usr/local/bin/docker tag ${DOCKER_REPO}:${IMAGE_TAG} ${DOCKER_REPO}:latest"
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                script {
                    echo 'Pushing Docker image to registry...'
                    
                    // Login to Docker registry
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIAL_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "/usr/local/bin/docker login -u \$DOCKER_USER -p \$DOCKER_PASS ${DOCKER_REGISTRY}"
                        sh "/usr/local/bin/docker push ${DOCKER_REPO}:${IMAGE_TAG}"
                        sh "/usr/local/bin/docker push ${DOCKER_REPO}:latest"
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([kubeconfigFile(credentialsId: "${KUBECONFIG_CREDENTIAL_ID}", variable: 'KUBECONFIG')]) {
                    script {
                        echo 'Deploying to Kubernetes...'
                        
                        // Apply Kubernetes manifests
                        sh '''
                            # Replace image tag in deployment
                            sed -i "s|IMAGE_TAG|${IMAGE_TAG}|g" k8s/deployment.yaml
                            
                            # Apply manifests
                            kubectl apply -f k8s/
                            
                            # Wait for deployment rollout
                            kubectl rollout status deployment/todo-app --timeout=300s
                            
                            # Get service info
                            kubectl get service todo-app-service
                        '''
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
            echo "Application deployed with image: ${DOCKER_REPO}:${IMAGE_TAG}"
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            echo 'Cleaning up...'
            // Clean up local Docker images to save space
            sh '''
                /usr/local/bin/docker image prune -f
                /usr/local/bin/docker container prune -f
            '''
        }
    }
}
