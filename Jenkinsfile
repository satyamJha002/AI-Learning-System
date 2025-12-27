pipeline {
    agent any

    environment {
        // adjust these paths if necessary
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend/ai-learning-assitant-app' 
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout code from the repository
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir("${BACKEND_DIR}") {
                    echo 'Building Backend...'
                    script {
                        if (isUnix()) {
                            sh 'npm install'
                        } else {
                            bat 'npm install'
                        }
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {
                    // Assuming Node/React
                    // For Windows, use 'bat' instead of 'sh' if Jenkins is on Windows directly
                    script {
                        if (isUnix()) {
                            sh 'npm install'
                            sh 'npm run build'
                        } else {
                            bat 'npm install'
                            bat 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                // Add test commands here
            }
        }
    }
}
