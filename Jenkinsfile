pipeline {
    agent any
    
    // Auto-trigger build on SCM changes (polls every minute)
    triggers {
        pollSCM('* * * * *')
    }
    
    environment {
        // Docker registry credentials (configure in Jenkins)
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_REPO = 'your-dockerhub-username/todo-app'
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
                    def dockerImage = docker.build("${DOCKER_REPO}:${IMAGE_TAG}")
                    
                    // Also tag as latest
                    dockerImage.tag("latest")
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                script {
                    echo 'Pushing Docker image to registry...'
                    docker.withRegistry("https://${DOCKER_REGISTRY}", "${DOCKER_CREDENTIAL_ID}") {
                        def dockerImage = docker.image("${DOCKER_REPO}:${IMAGE_TAG}")
                        dockerImage.push()
                        dockerImage.push("latest")
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
                docker image prune -f
                docker container prune -f
            '''
        }
    }
}
