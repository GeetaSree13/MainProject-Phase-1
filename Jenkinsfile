pipeline {
    agent any
    
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
                echo "Cloning GitHub repository"
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image from Dockerfile"
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
                    echo "Logging into Docker Hub"
                    sh """
                        docker login -u $DOCKERHUB_CREDENTIALS_USR -p $DOCKERHUB_CREDENTIALS_PSW
                    """
                }
            }
        }
        
        stage('Push Docker Image to DockerHub') {
            steps {
                script {
                    echo "Pushing Docker image to DockerHub"
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
                        echo "Deploying to Kubernetes cluster..."
                        sh """
                            sed -i '' "s|IMAGE_TAG|$APP_VERSION|g" k8s/deployment.yaml
                            kubectl apply -f k8s/
                            kubectl set image deployment/todo-app todo-app=$DOCKERHUB_REPO:$APP_VERSION --record
                            kubectl rollout status deployment/todo-app --timeout=300s
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo "Application deployed sucessfully with image: $DOCKERHUB_REPO:$APP_VERSION"
        }
        failure {
            echo "Pipeline failed"
        }
        always {
            echo "Cleaning up Docker images"
            sh '''
                docker image prune -f || true
                docker container prune -f || true
            '''
        }
    }
}