pipeline {
  agent any

  environment {
    IMAGE_NAME = 'smart-event-management-portal'
    IMAGE_TAG = "${BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Test') {
      steps {
        sh 'node --test'
      }
    }

    stage('Build Image') {
      steps {
        sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .'
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        sh 'kubectl apply -f k8s/namespace.yaml'
        sh 'kubectl apply -f k8s/configmap.yaml'
        sh 'kubectl apply -f k8s/deployment.yaml'
        sh 'kubectl apply -f k8s/service.yaml'
        sh 'kubectl apply -f k8s/hpa.yaml'
      }
    }
  }

  post {
    success {
      echo 'Smart Event Management Portal deployed successfully.'
    }
    failure {
      echo 'Pipeline failed. Check build logs for details.'
    }
  }
}
